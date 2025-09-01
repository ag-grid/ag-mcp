import {
  ErrorCode,
  GetPromptRequest,
  GetPromptResult,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { PromptDefinition } from "../utils/types";
import { Workspace } from "../workspace";
import { Semver } from "../utils/semver";

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

export const buildHandler = (workspace: Workspace) => {
  return async (
    args: GetPromptRequest["params"]["arguments"]
  ): Promise<GetPromptResult> => {
    if (!args || !args.version) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Please supply a version with your request."
      );
    }

    const targetVersion = await workspace.api.parseVersion(args.version);

    if (!targetVersion) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid version. Please use the version resource to see valid version."
      );
    }

    if (!workspace.context) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Migration can only be applied in a workspace which already has a version. Please use the quick-start prompt, or configure this workspace first."
      );
    }

    const currentVersion = workspace.context.version;

    if (!Semver.gt(targetVersion.semver, currentVersion.semver)) {
        throw new McpError(ErrorCode.InvalidParams, `The target version supplied must be greater than ${currentVersion}`)
    }

    const migrations = await workspace.getMigrationPath(
      targetVersion
    );

    const packages = workspace.getPackages();

    const prompt = `
I want to upgrade my version of AG Grid from ${currentVersion.id} to ${
      targetVersion.id
    }

To do this, please upgrade through the following versions. 
Make sure to apply all changes listed in the migration guide and get the code running at each version before moving on to the next version.

${migrations.map(
  (migration, index) => `
${index + 1}. Migrate to ${migration.migrationVersion}}.
    - Use my package manager to update the required packages. e.g. \`npm update ${packages.map(pkg => `${pkg}@${
      migration.migrationVersion} `)} 
    }\`.
    - Access the [AG Grid ${migration.migrationVersion} Migration Guide](${
    migration.url
  }).
    - Apply each change to all areas of code using AG Grid.
    - Pat special attention to: valid column definitions, registering modules correctly, and and custom styling.
`
)}

Once complete, the user should have successfully installed their required version and all their code should be running as before.
`;

    return {
      description: `Upgrade Guide for upgrading AG Grid from ${currentVersion.id} to ${targetVersion.id}`,
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
  };
};

export const createMigrationPrompt = (workspace: Workspace): PromptDefinition => {
  return {
    name: "migrate-version",
    listing,
    handler: buildHandler(workspace),
  };
};
