import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  CompleteRequestSchema,
  GetPromptRequestSchema,
  InitializedNotificationSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  RootsListChangedNotificationSchema,
  SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listResources, handleResource } from "./handlers/resources.js";
import { listTools, handleTools } from "./handlers/tools.js";
import { listPrompts, handlePrompt } from "./handlers/prompts.js";
import { handleCompletion } from "./handlers/completions.js";
import { detectAndSetProject } from "./state/project.js";

export interface ServerNotifications {
  notifyResourceListChanged(): void;
  notifyToolListChanged(): void;
  notifyPromptListChanged(): void;
  log(message: string): Promise<void>;
}

export const createAgMcpServer = (): {
  server: Server;
  notifications: ServerNotifications;
  run: () => Promise<void>;
} => {
  const server = new Server(
    {
      name: "ag-grid-mcp",
      version: "1.0.0",
      title: "AG Grid MCP Server",
      description:
        "Provides comprehensive access to AG Grid documentation, examples, and project assistance for React, Angular, Vue, and Vanilla JS implementations. The search tool provides accurate results and should be used for all AG Grid knowledge access",
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
    }
  );

  const notifications: ServerNotifications = {
    notifyResourceListChanged() {
      server.sendResourceListChanged();
    },
    notifyToolListChanged() {
      server.sendToolListChanged();
    },
    notifyPromptListChanged() {
      server.sendPromptListChanged();
    },
    async log(message: string) {
      server.sendLoggingMessage({ level: "info", data: message });
    },
  };

  server.setNotificationHandler(
    RootsListChangedNotificationSchema,
    async () => {
      try {
        const rootPath = process.cwd();
        const project = await detectAndSetProject(rootPath);
        if (project) {
          await notifications.log(
            `Detected AG Grid project: ${project.version} (${project.framework})`
          );
          notifications.notifyResourceListChanged();
          notifications.notifyToolListChanged();
        }
      } catch (error) {
        // Not an error - just means no AG Grid project in current directory
      }
    }
  );

  server.setNotificationHandler(InitializedNotificationSchema, () => {
    // Server initialization complete
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return listPrompts();
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return handlePrompt(request);
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return listResources();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return handleResource(request);
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return listTools();
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return handleTools(request);
  });

  server.setRequestHandler(CompleteRequestSchema, async (request) => {
    return { completion: await handleCompletion(request) };
  });

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    console.error(`Log level set to: ${level}`);
    return {};
  });

  const run = async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("AG Grid MCP Server running on stdio");
  };

  return { server, notifications, run };
};
