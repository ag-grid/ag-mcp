import {
  ErrorCode,
  GetPromptRequest,
  GetPromptResult,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { PromptDefinition } from "../utils/types";

const listing = {
  name: "migrate-version",
  description: "Help the user migrate to a more recent version of AG-Grid",
  arguments: [
    {
      name: "version",
      description: "The version to migrate to",
      required: true,
    },
  ],
};

async function handler(args: GetPromptRequest["params"]["arguments"]): Promise<GetPromptResult> {
  if (!args || !args.version) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Please supply a version with your request."
    );
  }

  const targetVersion = args.version;
  const currentVersion = "34.0.0";

  const prompt = `
I want to upgrade my version of AG Grid React from ${currentVersion} to ${targetVersion}.

Please help me:
1. Update the AG Grid React package to version ${targetVersion}
2. Check for breaking changes in the migration guide
3. Update my code to handle any API changes
4. Test that the grid still works correctly

Please provide practical, working code examples for any changes needed.
`;

  return {
    description: `Upgrade Guide for upgrading AG Grid React from ${currentVersion} to ${targetVersion}`,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: prompt,
        },
      },
    ],
  };
}

export const createMigrationPrompt = (): PromptDefinition => {
  return {
    name: "migrate-version",
    listing,
    handler,
  };
};
