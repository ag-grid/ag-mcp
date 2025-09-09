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
import { API_URL } from "./constants.js";

export class AgMcpContext {
  private prompts = [createQuickStartPrompt(), createMigrationPrompt()];

  constructor(private notify: ServerNotifications) {}

  async onRootsChanged(roots: Root[]): Promise<void> {
    // No-op for simplified version
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
    return {
      tools: [
        {
          name: "search_docs",
          description: "Search AG Grid React documentation for version 34.0.0",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for AG Grid documentation",
              },
            },
            required: ["query"],
          },
        },
      ],
    };
  }

  async handleTools(tool: CallToolRequest): Promise<CallToolResult> {
    if (tool.params.name === "search_docs") {
      const query = tool.params.arguments?.query as string;
      if (!query) {
        throw new Error("Query parameter is required");
      }

      try {
        const url = `${API_URL}34.1.0/react/search?q=${encodeURIComponent(query)}`;
        console.error(`Requesting: ${url}`);
        
        const response = await fetch(url);
        console.error(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.error(`Response text (first 100 chars): ${responseText.substring(0, 100)}`);
        
        const result = JSON.parse(responseText);

        const content = result.results
          .map((x: any) => x.metadata.content)
          .join("\n\n\n");

        console.error(content);

        return {
          content: [
            {
              type: "text",
              text: content,
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

    throw new Error(`Unknown tool: ${tool.params.name}`);
  }
}
