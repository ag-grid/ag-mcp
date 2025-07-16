import { CallToolRequest, CallToolResult, GetPromptRequest, GetPromptResult, Prompt, ReadResourceRequest, ReadResourceResult, Resource, Tool } from "@modelcontextprotocol/sdk/types"

export type PromptDefinition = {
    name: string,
    listing: Prompt,
    handler: (args: GetPromptRequest["params"]["arguments"]) => Promise<GetPromptResult>
}

export type ToolDefinition = {
    name: string,
    listing: Tool,
    handler: (args: CallToolRequest["params"]["arguments"]) => Promise<CallToolResult>
}

export type ResourceDefinition = {
    name: string,
    listing: Resource,
    handler: (uri: string) => Promise<ReadResourceResult>
}