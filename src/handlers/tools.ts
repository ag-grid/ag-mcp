import {
  ListToolsResult,
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { GRID_FRAMEWORKS } from "../constants.js";
import { fetchSearch } from "../api/fetch.js";
import { getAvailableVersions } from "../api/version.js";
import {
  getCurrentProject,
  detectAndSetProject,
  setCurrentProject,
  getProjectVersion,
  getProjectFramework,
  getProjectInfo,
  ProjectState,
} from "../state/project.js";
import { validateVersionConfig, VersionValidationError } from "../utils/version-validator.js";

export const listTools = (): ListToolsResult => {
  const project = getCurrentProject();
  const versionInfo = project
    ? `for version ${project.version} (${project.framework})`
    : "for the detected or latest AG Grid version";

  return {
    tools: [
      {
        name: "search_docs",
        description: `Search AG Grid documentation ${versionInfo}. Use this to find specific information about AG Grid features, APIs, configurations, and troubleshooting. Supports natural language queries.`,
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query for AG Grid documentation (e.g., 'column sorting', 'cell renderers', 'data grid performance')",
            },
            version: {
              type: "string",
              description:
                "Optional: Override version for search (if not using detected version)",
            },
            framework: {
              type: "string",
              enum: GRID_FRAMEWORKS,
              description:
                "Optional: Override framework for search (if not using detected framework)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "detect_version",
        description:
          "Detect AG Grid version and framework in the current project by analyzing package.json and dependencies. Use this when you need to understand the project setup.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "Optional: Path to the project directory (defaults to current workspace)",
            },
          },
        },
      },
      {
        name: "list_versions",
        description:
          "List all available AG Grid versions from the API. Use this to see what versions are available for migration or reference.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "set_versions",
        description:
          "Set the AG Grid version and framework to use for documentation searches and resources. Use this when working with a specific version or framework combination.",
        inputSchema: {
          type: "object",
          properties: {
            version: {
              type: "string",
              description: "AG Grid version to use (e.g., '34.1.0')",
            },
            framework: {
              type: "string",
              enum: GRID_FRAMEWORKS,
              description:
                "Framework to use for documentation (react, angular, vue, vanilla)",
            },
          },
          required: ["version", "framework"],
        },
      },
    ],
  };
};

export const handleTools = async (
  request: CallToolRequest
): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  // Skip validation for version management tools
  const skipValidationTools = ["detect_version", "list_versions", "set_version", "set_versions"];
  
  if (!skipValidationTools.includes(name)) {
    try {
      await validateVersionConfig();
    } catch (error) {
      if (error instanceof VersionValidationError) {
        return {
          content: [
            {
              type: "text",
              text: `${error.message}. ${error.suggestion}`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }

  switch (name) {
    case "search_docs": {
      const query = args?.query as string;
      if (!query) {
        throw new Error("Query parameter is required");
      }

      const version = (args?.version as string) || (await getProjectVersion());

      const framework = (args?.framework as any) || getProjectFramework();

      try {
        const result = await fetchSearch(version, framework, query, { links: "mcp" });

        const content = result.results
          .map((x) => x.data.content)
          .join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: `# AG Grid Documentation Search Results\n\n**Query:** ${query}\n**Version:** ${version}\n**Framework:** ${framework}\n**Total Results:** ${result.results.length}\n\n---\n\n${content}`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Search failed: ${error}\n\n*Tip: Try using simpler keywords or check if the version/framework combination is valid.*`,
            },
          ],
          isError: true,
        };
      }
    }

    case "detect_version": {
      const projectPath = (args?.path as string) || process.cwd();

      try {
        const project = await detectAndSetProject(projectPath);

        if (!project) {
          return {
            content: [
              {
                type: "text",
                text: `No AG Grid installation detected in ${projectPath}\n\n*Tip: Make sure you're in a directory with a package.json file that includes AG Grid dependencies.*`,
              },
            ],
            isError: false,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `${getProjectInfo()}\n\n*Project detection successful! This version and framework will now be used as defaults for searches and resources.*`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Detection failed: ${error}\n\n*Tip: Ensure the path exists and contains a valid package.json file.*`,
            },
          ],
          isError: true,
        };
      }
    }

    case "list_versions": {
      try {
        const versions = await getAvailableVersions();

        const currentProject = getCurrentProject();
        const currentVersionNote = currentProject
          ? `\n\n*Current project uses: v${currentProject.version} (${currentProject.framework})*`
          : "";

        return {
          content: [
            {
              type: "text",
              text: `**Available AG Grid Versions:**\n\n${versions
                .map((v) => `- ${v}`)
                .join("\n")}\n\n*Total: ${
                versions.length
              } versions*${currentVersionNote}`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch versions: ${error}\n\n*Tip: Check your internet connection and try again.*`,
            },
          ],
          isError: true,
        };
      }
    }

    case "set_version":
    case "set_versions": {
      const version = args?.version as string;
      const framework = args?.framework as string;

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
                text: `Invalid version: ${version}\n\n**Available versions:** ${availableVersions
                  .slice(0, 5)
                  .join(", ")}${
                  availableVersions.length > 5 ? "..." : ""
                }\n\n*Use the list_versions tool to see all available versions.*`,
              },
            ],
            isError: true,
          };
        }

        // Validate framework
        if (!GRID_FRAMEWORKS.includes(framework as any)) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid framework: ${framework}\n\n**Available frameworks:** ${GRID_FRAMEWORKS.join(
                  ", "
                )}`,
              },
            ],
            isError: true,
          };
        }

        // Set the project state manually
        const newProject: ProjectState = {
          path: getCurrentProject()?.path || "manual",
          version,
          framework: framework as any,
        };

        setCurrentProject(newProject);

        return {
          content: [
            {
              type: "text",
              text: `Successfully set AG Grid configuration:\n- Version: ${version}\n- Framework: ${framework}\n\n*This configuration will now be used as the default for searches and resources.*`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to set version: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
