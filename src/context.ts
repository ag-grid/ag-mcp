import {
  CallToolRequest,
  CallToolResult,
  GetPromptRequest,
  GetPromptResult,
  ListPromptsResult,
  ListResourcesResult,
  ListToolsResult,
  ReadResourceRequest,
  ReadResourceResult,
  Root,
} from "@modelcontextprotocol/sdk/types.js";
import { ServerNotifications } from "./server.js";
import { createQuickStartPrompt } from "./prompts/quick-start.js";
import { createMigrationPrompt } from "./prompts/migration.js";
import { GridFramework, GRID_FRAMEWORKS } from "./constants.js";
import { fetchSearch } from "./api/fetch.js";
import { getAvailableVersions, getLatestVersion } from "./api/version.js";
import { readProject, saveProject, getProject } from "./config/index.js";

export class AgMcpContext {
  private prompts = [createQuickStartPrompt(), createMigrationPrompt()];
  private currentProject: { path: string; version: string; framework: GridFramework } | undefined;

  constructor(private notify: ServerNotifications) {}

  async onRootsChanged(roots: Root[]): Promise<void> {
    // Try to detect AG Grid project in the first root
    if (roots.length > 0) {
      const rootPath = roots[0].uri.replace('file://', '');
      try {
        const project = await readProject(rootPath);
        if (project) {
          this.currentProject = {
            path: project.path,
            version: project.version,
            framework: project.framework
          };
          await saveProject(project);
        }
      } catch (error) {
        console.error('Failed to detect AG Grid project:', error);
      }
    }
  }

  async listPrompts(): Promise<ListPromptsResult> {
    return {
      prompts: this.prompts.map((p) => p.listing),
    };
  }

  async handlePrompt(prompt: GetPromptRequest): Promise<GetPromptResult> {
    const promptDef = this.prompts.find((p) => p.name === prompt.params.name);
    if (!promptDef) {
      throw new Error(`Prompt not found: ${prompt.params.name}`);
    }
    return promptDef.handler(prompt.params.arguments);
  }

  async listResources(): Promise<ListResourcesResult> {
    return {
      resources: [],
    };
  }

  async handleResource(
    resource: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    throw new Error("Resources not supported in simplified version");
  }

  async listTools(): Promise<ListToolsResult> {
    const versionInfo = this.currentProject ? 
      `for version ${this.currentProject.version} (${this.currentProject.framework})` :
      "for the detected or latest AG Grid version";

    return {
      tools: [
        {
          name: "search_docs",
          description: `Search AG Grid documentation ${versionInfo}`,
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for AG Grid documentation",
              },
              version: {
                type: "string",
                description: "Optional: Override version for search (if not using detected version)",
              },
              framework: {
                type: "string",
                enum: GRID_FRAMEWORKS,
                description: "Optional: Override framework for search (if not using detected framework)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "detect_version",
          description: "Detect AG Grid version and framework in the current project",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Optional: Path to the project directory (defaults to current workspace)",
              },
            },
          },
        },
        {
          name: "list_versions",
          description: "List all available AG Grid versions",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "set_version",
          description: "Set the AG Grid version and framework to use for documentation searches",
          inputSchema: {
            type: "object",
            properties: {
              version: {
                type: "string",
                description: "AG Grid version to use",
              },
              framework: {
                type: "string",
                enum: GRID_FRAMEWORKS,
                description: "Framework to use for documentation",
              },
            },
            required: ["version", "framework"],
          },
        },
      ],
    };
  }

  async handleTools(tool: CallToolRequest): Promise<CallToolResult> {
    switch (tool.params.name) {
      case "search_docs": {
        const query = tool.params.arguments?.query as string;
        if (!query) {
          throw new Error("Query parameter is required");
        }

        // Use override parameters or detected/default values
        const version = (tool.params.arguments?.version as string) || 
                       this.currentProject?.version || 
                       await getLatestVersion() || 
                       "34.1.0";
        
        const framework = (tool.params.arguments?.framework as GridFramework) || 
                         this.currentProject?.framework || 
                         "react";

        try {
          const result = await fetchSearch(version, framework, query);
          
          const content = result.results
            .map((x) => x.metadata.content)
            .join("\n\n\n");

          return {
            content: [
              {
                type: "text",
                text: `# AG Grid Documentation Search Results\n\n**Query:** ${query}\n**Version:** ${version}\n**Framework:** ${framework}\n**Total Results:** ${result.meta.total}\n\n---\n\n${content}`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Search failed: ${error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "detect_version": {
        const projectPath = (tool.params.arguments?.path as string) || process.cwd();
        
        try {
          const project = await readProject(projectPath);
          
          if (!project) {
            return {
              content: [
                {
                  type: "text",
                  text: `No AG Grid installation detected in ${projectPath}`,
                },
              ],
              isError: false,
            };
          }

          // Update current project
          this.currentProject = {
            path: project.path,
            version: project.version,
            framework: project.framework
          };

          await saveProject(project);

          return {
            content: [
              {
                type: "text",
                text: `**AG Grid Project Detected:**\n- Path: ${project.path}\n- Version: ${project.version}\n- Framework: ${project.framework}\n- Enterprise: ${project.enterprise ? 'Yes' : 'No'}`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Detection failed: ${error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "list_versions": {
        try {
          const versions = await getAvailableVersions();
          
          return {
            content: [
              {
                type: "text",
                text: `**Available AG Grid Versions:**\n\n${versions.map(v => `- ${v}`).join('\n')}\n\n*Total: ${versions.length} versions*`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch versions: ${error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "set_version": {
        const version = tool.params.arguments?.version as string;
        const framework = tool.params.arguments?.framework as GridFramework;
        
        if (!version || !framework) {
          throw new Error("Both version and framework parameters are required");
        }

        try {
          // Validate version exists
          const availableVersions = await getAvailableVersions();
          if (!availableVersions.includes(version)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Invalid version: ${version}. Available versions: ${availableVersions.slice(0, 5).join(', ')}${availableVersions.length > 5 ? '...' : ''}`,
                },
              ],
              isError: true,
            };
          }

          // Update current project configuration
          this.currentProject = {
            path: process.cwd(),
            version,
            framework
          };

          return {
            content: [
              {
                type: "text",
                text: `**Configuration Updated:**\n- Version: ${version}\n- Framework: ${framework}\n\nDocumentation searches will now use these settings.`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Configuration update failed: ${error}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${tool.params.name}`);
    }
  }
}
