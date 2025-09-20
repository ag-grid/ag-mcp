import {
  ListPromptsResult,
  GetPromptRequest,
  GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";
import { createQuickStartPrompt } from "../prompts/quick-start.js";
import { createMigrationPrompt } from "../prompts/migration.js";
import {
  validateVersionConfig,
  VersionValidationError,
} from "../utils/version-validator.js";

const prompts = [createQuickStartPrompt(), createMigrationPrompt()];

export const listPrompts = (): ListPromptsResult => {
  return {
    prompts: prompts.map((p) => p.listing),
  };
};

export const handlePrompt = async (
  request: GetPromptRequest
): Promise<GetPromptResult> => {
  const { name, arguments: args } = request.params;

  if (name !== "quick-start") {
    try {
      await validateVersionConfig();
    } catch (error) {
      if (error instanceof VersionValidationError) {
        throw new Error(`${error.message}. ${error.suggestion}`);
      }
      throw error;
    }
  }

  const promptDef = prompts.find((p) => p.name === name);
  if (!promptDef) {
    throw new Error(
      `Prompt not found: ${name}. Available prompts: ${prompts
        .map((p) => p.name)
        .join(", ")}`
    );
  }

  return promptDef.handler(args);
};
