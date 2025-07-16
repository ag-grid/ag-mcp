import {
  CallToolRequest,
  ErrorCode,
  GetPromptRequest,
  McpError,
  Prompt,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types";
import { AgContentApi } from "../api";
import {
  FrameworkName,
  FrameworkType,
  DocList,
  ExampleList,
  MigrationList,
  ChangeLog,
  ModuleList,
  Version,
} from "../api/types";
import { Semver } from "../utils/semver";
import {
  PromptDefinition,
  ResourceDefinition,
  ToolDefinition,
} from "../utils/types";
import { createQuickStartPrompt } from "../prompts/quick-start";
import { createMigrationPrompt } from "../prompts/migration";

export type WorkspaceContext = {
  version: Version;
  framework: FrameworkName;
  isEnterprise: boolean;
};

export type InstalledWorkspace = {
  id: string;
  uri: string;
  context: WorkspaceContext;
};

export class Workspace {
  public readonly id: string;
  public readonly name?: string;
  public readonly uri: string;
  public readonly context: WorkspaceContext | undefined;

  private prompts: PromptDefinition[] = [];
  private tools: ToolDefinition[] = [];
  private resources: Promise<ResourceDefinition[]>;

  private packages: string[] = [];

  constructor(
    public api: AgContentApi,
    workspace: {
      name?: string;
      uri: string;
      context: WorkspaceContext | undefined;
    }
  ) {
    this.id = this.name
      ? this.name.toLowerCase().replace(" ", "-")
      : workspace.uri.split("/").pop() || "workspace";
    this.name = workspace.name;
    this.uri = workspace.uri;
    this.context = workspace.context;

    this.resources = this.getResources();
    this.prompts = this.getPrompts();
  }

  get isInstalled(): boolean {
    return this.context !== undefined;
  }

  get framework(): string | undefined {
    return this.context?.framework;
  }

  get version(): string | undefined {
    return this.context?.version.id;
  }

  get isEnterprise(): boolean {
    return this.context?.isEnterprise || false;
  }

  get displayName(): string {
    return this.name || this.uri.split("/").pop() || this.uri;
  }

  get summary(): string {
    if (!this.context) {
      return `${this.displayName} (No AG-Grid)`;
    }
    return `${this.displayName} (${this.context.framework} v${
      this.context.version
    }${this.context.isEnterprise ? " Enterprise" : ""})`;
  }

  private ensureValid(): asserts this is InstalledWorkspace {
    if (!this.context) {
      throw new Error(
        `Workspace ${this.uri} does not have valid AG-Grid context`
      );
    }
  }

  async listPrompts(): Promise<Prompt[]> {
    return this.prompts.map((p) => p.listing);
  }

  async handlePromptCall(
    name: string,
    args: GetPromptRequest["params"]["arguments"]
  ) {
    const prompt = this.prompts.find((p) => p.name === name);

    if (!prompt) {
      throw new McpError(ErrorCode.MethodNotFound, "Couldn't find prompt");
    }

    return prompt.handler(args);
  }

  async listResources(): Promise<Resource[]> {
    return (await this.resources).map((r) => r.listing);
  }

  async handleResource(uri: string) {
    let resource = (await this.resources).find((r) => r.name === uri);

    if (!resource) {
      throw new McpError(ErrorCode.MethodNotFound, "Couldn't find resource");
    }

    return resource.handler(uri);
  }

  async listTools(): Promise<Tool[]> {
    return this.tools.map((t) => t.listing);
  }

  async handleToolCall(
    name: string,
    args: CallToolRequest["params"]["arguments"]
  ) {
    const tool = this.tools.find((p) => p.name === name);

    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, "Couldn't find tool");
    }

    return tool.handler(args);
  }

  private getResources(): Promise<ResourceDefinition[]> {
    const fetchUrl = (url: string, title: string, mimeType: string) => {
      return fetch(url).then(async (res) => {
        const text = await res.text();
        return {
          contents: [
            {
              uri: url,
              name: url,
              title,
              mimeType,
              text,
            },
          ],
        };
      });
    };

    const docs = this.getDocs().then((docs) =>
      docs
        .filter((doc) => this.isEnterprise || !doc.isEnterprise)
        .map((doc) => ({
          name: doc.url,
          listing: {
            name: doc.id,
            uri: doc.url,
            title: doc.name,
            description: doc.description,
          },
          handler: (uri: string) => {
            return fetchUrl(uri, doc.name, doc.mimeType);
          },
        }))
    );

    const api = this.getApi().then((docs) =>
      docs.map((doc) => ({
        name: doc.url,
        listing: {
          name: doc.id,
          uri: doc.url,
          title: doc.name,
          description: doc.description,
          mimiType: doc.mimeType,
        },
        handler: (uri: string) => {
          return fetchUrl(uri, doc.name, doc.mimeType);
        },
      }))
    );

    const examples = this.getTypescriptExamples().then((examples) =>
      examples.map((example) => ({
        name: example.url,
        listing: {
          name: example.pageName,
          uri: example.url,
          title: example.exampleName,
          description: `The code behind the example displayed here: ${example.preview}`,
          mimeType: "application/javascript",
        },
        handler: (uri: string) => {
          return fetchUrl(uri, example.exampleName, "application/javascript");
        },
      }))
    );
    return Promise.all([docs, api, examples]).then((d) => d.flat());
  }

  private getPrompts() {
    const prompts = [];
    if (!this.context) {
      prompts.push(createQuickStartPrompt(this));
    } else if (!this.context.version.isLatest) {
      prompts.push(createMigrationPrompt(this));
    }
    return prompts;
  }

  private getFrameworkApi() {
    this.ensureValid();
    return this.api
      .version(this.context.version.id)
      .framework(this.context.framework);
  }

  async getDocs(): Promise<DocList> {
    return this.getFrameworkApi().docs();
  }

  async searchDocs(query: string): Promise<DocList> {
    const docs = await this.getDocs();
    const lowerQuery = query.toLowerCase();
    return docs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowerQuery) ||
        (doc.description && doc.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get examples for this workspace's framework and version
   */
  async getExamples(type: FrameworkType): Promise<ExampleList> {
    return this.getFrameworkApi().examples(type);
  }

  /**
   * Get TypeScript examples (most common)
   */
  async getTypescriptExamples(): Promise<ExampleList> {
    return this.getExamples("typescript");
  }

  /**
   * Get JavaScript examples
   */
  async getJavascriptExamples(): Promise<ExampleList> {
    return this.getExamples("javascript");
  }

  /**
   * Get a specific example by name
   */
  async getExample(type: FrameworkType, exampleName: string) {
    return this.getFrameworkApi().example(type, exampleName);
  }

  /**
   * Search examples by name or page name
   */
  async searchExamples(
    type: FrameworkType,
    query: string
  ): Promise<ExampleList> {
    const examples = await this.getExamples(type);
    const lowerQuery = query.toLowerCase();
    return examples.filter(
      (example) =>
        example.exampleName.toLowerCase().includes(lowerQuery) ||
        example.pageName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get migration guides for this workspace's framework and version
   */
  async getMigrations(): Promise<MigrationList> {
    return this.getFrameworkApi().migrations();
  }

  /**
   * Get a specific migration by version
   */
  async getMigration(migrationVersion: string) {
    return this.getFrameworkApi().migration(migrationVersion);
  }

  async getMigrationPath(target: Version): Promise<MigrationList> {
    this.ensureValid();
    const migrations = await this.getMigrations();
    return migrations.filter((migration) => {
      Semver.between(
        migration.semver,
        this.context.version.semver,
        target.semver
      );
    });
  }

  /**
   * Get API documentation for this workspace's framework and version
   */
  async getApi() {
    return this.getFrameworkApi().api();
  }

  /**
   * Get version-specific information (changelog, modules, etc.)
   */
  private getVersionApi() {
    this.ensureValid();
    return this.api.version(this.context.version.id);
  }

  /**
   * Get changelog for this workspace's version
   */
  async getChangelog(): Promise<ChangeLog> {
    return this.getVersionApi().changelog();
  }

  /**
   * Get modules for this workspace's version
   */
  async getModules(): Promise<ModuleList> {
    return this.getVersionApi().modules();
  }

  /**
   * Get available frameworks for this workspace's version
   */
  async getAvailableFrameworks() {
    return this.getVersionApi().frameworks();
  }

  /**
   * Get filtered documentation based on enterprise status
   */
  async getDocsForLicense(): Promise<DocList> {
    const docs = await this.getDocs();
    if (this.isEnterprise) {
      return docs; // Enterprise users can see all docs
    } else {
      return docs.filter((doc) => !doc.isEnterprise); // Community users only see community docs
    }
  }

  /**
   * Get relevant migration guides (to current version and newer)
   */
  async getRelevantMigrations(): Promise<MigrationList> {
    this.ensureValid();
    const migrations = await this.getMigrations();
    // You might want to filter migrations based on current version
    return migrations;
  }

  getPackages() {
    return this.packages;
  }

  /**
   * Check if a specific feature is available in this workspace
   */
  async isFeatureAvailable(featureName: string): Promise<boolean> {
    try {
      const modules = await this.getModules();
      // Check if any module matches the feature name
      for (const group of modules.groups) {
        if (group.children) {
          for (const module of group.children) {
            if (
              module.name.toLowerCase().includes(featureName.toLowerCase()) ||
              (module.moduleName &&
                module.moduleName
                  .toLowerCase()
                  .includes(featureName.toLowerCase()))
            ) {
              // If feature requires enterprise and workspace doesn't have it
              if (module.isEnterprise && !this.isEnterprise) {
                return false;
              }
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}
