import fs from "node:fs/promises";
import path from "node:path";
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
import { AgContentApi } from "./api";
import { Workspace, WorkspaceContext } from "./workspace";
import { ServerNotifications } from "./server";
import { FrameworkName } from "./api/types";

const AG_GRID_PACKAGES = [
  "ag-grid-community",
  "ag-grid-enterprise",
  "ag-grid-react",
  "ag-grid-angular",
  "ag-grid-vue3",
  "ag-grid-vue",
] as const;

interface SearchParams {
  /** Search query string */
  q: string;
  
  /** Document sets to search (defaults to all if not specified) */
  docs?: ('grid' | 'charts' | 'dash')[];
  
  /** Content sections to include (defaults to all if not specified) */
  sections?: ('docs' | 'examples' | 'definitions')[];
  
  /** Whether to include example code inline */
  inline_examples?: boolean;
  
  /** Whether to exclude enterprise documentation */
  exclude_enterprise?: boolean;
}


export class AgMcpContext {
  private workspaces: Workspace[] = [];
  private roots: Root[] = [];

  constructor(private api: AgContentApi, private notify: ServerNotifications) {
    this.workspaces.push(
      new Workspace(api, {
        name: "root",
        uri: "",
        context: {
          version: {
            releaseDate: new Date(),
            url: "",
            isLatest: true,
            id: "",
            semver: {
              major: 1,
              minor: 0,
              patch: 0,

            }
          },
          framework: "react",
          isEnterprise: true
        }
      })
    )
  }

  private async readWorkspaceContext(
    workspaceRoot: string
  ): Promise<WorkspaceContext | undefined> {
    const packages: Partial<Record<(typeof AG_GRID_PACKAGES)[number], string>> =
      {};
    console.error("HERE")
    for (const packageName of AG_GRID_PACKAGES) {
      const packageJsonPath = path.join(
        workspaceRoot,
        "node_modules",
        packageName,
        "package.json"
      );

      console.error(packageJsonPath)

      try {
        const packageJson = await fs.readFile(packageJsonPath, {
          encoding: "utf-8",
        });
        console.error(packageJson)
        const packageInfo = JSON.parse(packageJson);
        packages[packageName] = packageInfo.version;
      } catch (error) {
        console.error(error)
        continue;
      }
    }
    console.error(JSON.stringify(packages, null, 2))

    const isEnterprise = !!packages["ag-grid-enterprise"];
    let framework: FrameworkName = "javascript";
    let versionId: string | undefined = undefined;

    let context: WorkspaceContext | undefined;
    if (packages["ag-grid-react"]) {
      (framework = "react"), (versionId = packages["ag-grid-react"]);
    } else if (packages["ag-grid-angular"]) {
      framework = "angular";
      versionId = packages["ag-grid-angular"];
    } else if (packages["ag-grid-vue3"]) {
      (framework = "vue"), (versionId = packages["ag-grid-vue3"]);
    } else if (packages["ag-grid-community"]) {
      versionId = packages["ag-grid-community"];
    }

    if (versionId) {
      const version = await this.api.parseVersion(versionId);

      return this.api
        .parseFramework(versionId, framework)
        .then((value) => ({ version, framework, isEnterprise }))
        .catch(() => {
          return undefined;
        });
    }

    return undefined;
  }

  private async loadWorkspaces(roots: Root[]): Promise<void> {
    this.workspaces = [];
    console.error("Checking roots");
    for (const root of roots) {
      // Convert file:// URI to local path
      const rootPath = root.uri.startsWith('file://') ? root.uri.slice(6) : root.uri;
      const context = await this.readWorkspaceContext(rootPath);
      console.error(context);
      this.workspaces.push(
        new Workspace(this.api, {
          ...root,
          context,
        })
      );
    }

    console.error(this.workspaces);

    this.notify.notifyPromptListChanged();
    this.notify.notifyResourceListChanged();
    this.notify.notifyToolListChanged();
  }

  async onRootsChanged(roots: Root[]): Promise<void> {
    if (roots !== this.roots) {
        this.roots = roots;
        return this.loadWorkspaces(roots);
    }
  }

  async listPrompts(): Promise<ListPromptsResult> {
    const prompts = await Promise.all(
      this.workspaces.map((workspace) => workspace.listPrompts())
    ).then((p) => p.flat());
    return {
      prompts,
    };
  }

  async handlePrompt(prompt: GetPromptRequest): Promise<GetPromptResult> {
    const workspace = this.workspaces[0];
    return workspace.handlePromptCall(
      prompt.params.name,
      prompt.params.arguments
    );
  }

  async listResources(): Promise<ListResourcesResult> {
    const resources = await Promise.all(
      this.workspaces.map((workspace) => workspace.listResources())
    ).then((p) => p.flat());
    return {
      resources,
    };
  }

  async handleResource(resource: ReadResourceRequest): Promise<ReadResourceResult> {
    const workspace = this.workspaces[0];
    return workspace.handleResource(resource.params.uri)
  }

  async listTools(): Promise<ListToolsResult> {
    const tools = await Promise.all(
      this.workspaces.map((workspace) => workspace.listTools())
    ).then((p) => p.flat());
    return {
      tools,
    };
  }

  async handleTools(tool: CallToolRequest): Promise<CallToolResult> {
    const workspace = this.workspaces[0];
    return workspace.handleToolCall(tool.params.name, tool.params.arguments);
  }

  workspace(id: string): Workspace | undefined {
    return this.workspaces.find((w) => w.id === id);
  }

  clearCache(): void {
    this.workspaces = [];
  }
}
