import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  InitializedNotificationSchema,
  InitializeRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  RootsListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types";
import { AgContentApi } from "./api";
import { AgMcpContext } from "./context";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

export interface ServerNotifications {
  notifyResourceListChanged(): void;
  notifyToolListChanged(): void;
  notifyPromptListChanged(): void;
  log(message: string): Promise<void>;
}

export class AgMcpServer implements ServerNotifications {
  private server: Server;
  private api: AgContentApi;
  private context: AgMcpContext;

  constructor(baseUrl: string) {
    this.api = new AgContentApi(baseUrl);
    this.context = new AgMcpContext(this.api, this);

    this.server = new Server(
      {
        name: "ag-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {
            listChanged: true,
          },
          prompts: {
            listChanged: true,
          },
          tools: {
            listChanged: true,
          },
          completions: {},
          logging: {},
        },
      },
    );

    
    this.server.setNotificationHandler(
      RootsListChangedNotificationSchema,
      () => {
        this.updateRoots();
      }
    );

    this.server.setNotificationHandler(InitializedNotificationSchema, () => {
      this.updateRoots();
    })

    this.server.setRequestHandler(ListPromptsRequestSchema, () => {
      return this.context.listPrompts();
    });

    this.server.setRequestHandler(GetPromptRequestSchema, (params) => {
      return this.context.handlePrompt(params);
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, () => {
      return this.context.listResources();
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, (params) => {
      return this.context.handleResource(params);
    });

    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return this.context.listTools();
    });

    this.server.setRequestHandler(CallToolRequestSchema, (params) => {
      return this.context.handleTools(params);
    });    
  }

  async log(message: string) {
    this.server.sendLoggingMessage({ level: "info", data: message });
  }

  async updateRoots() {
    this.server.listRoots().then(({ roots }) => {
      this.server.sendLoggingMessage({ level: "info", data: "Updating Roots" });
      this.context.onRootsChanged(roots);
    });
  }

  notifyResourceListChanged() {
    this.server.sendResourceListChanged();
  }

  notifyToolListChanged() {
    this.server.sendToolListChanged();
  }

  notifyPromptListChanged() {
    this.server.sendPromptListChanged();
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error("AG MCP Server running on stdio");
  }
}
