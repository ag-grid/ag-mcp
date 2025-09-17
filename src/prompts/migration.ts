import {
  ErrorCode,
  GetPromptRequest,
  GetPromptResult,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { PromptDefinition } from "../utils/types";

const listing = {
  name: "migrate-version",
  description: "Help the user migrate to a more recent version of AG-Grid with framework-specific guidance",
  arguments: [
    {
      name: "version",
      description: "The target version to migrate to",
      required: true,
    },
    {
      name: "framework",
      description: "Framework (react, angular, vue, vanilla) - will auto-detect if not provided",
      required: false,
    },
    {
      name: "currentVersion",
      description: "Current version - will auto-detect if not provided",
      required: false,
    },
  ],
};

async function handler(args: GetPromptRequest["params"]["arguments"]): Promise<GetPromptResult> {
  if (!args || !args.version) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Please supply a target version with your request."
    );
  }

  const targetVersion = args.version;
  const framework = args.framework || "react"; // Default to react if not provided
  const currentVersion = args.currentVersion || "[detected version]"; // Will be replaced with actual detected version

  const frameworkSpecificInstructions = {
    react: {
      packageName: "ag-grid-react",
      imports: "import { AgGridReact } from 'ag-grid-react';",
      additional: "- Update React component props and refs\n- Check for React 18+ compatibility changes"
    },
    angular: {
      packageName: "ag-grid-angular", 
      imports: "import { AgGridModule } from 'ag-grid-angular';",
      additional: "- Update Angular module imports\n- Check for Angular version compatibility\n- Update component templates"
    },
    vue: {
      packageName: "ag-grid-vue3",
      imports: "import { AgGridVue } from 'ag-grid-vue3';",
      additional: "- Update Vue component registration\n- Check for Vue 3 composition API changes\n- Update template syntax"
    },
    vanilla: {
      packageName: "ag-grid-community",
      imports: "import { createGrid } from 'ag-grid-community';",
      additional: "- Update grid creation API calls\n- Check for DOM integration changes"
    }
  };

  const frameworkInfo = frameworkSpecificInstructions[framework as keyof typeof frameworkSpecificInstructions] || frameworkSpecificInstructions.react;

  const prompt = `
I want to upgrade my AG Grid ${framework} project from ${currentVersion} to ${targetVersion}.

**Important:** First, I recommend using the MCP tools available to help with this migration:
1. Use the "detect_version" tool to automatically detect your current AG Grid version and framework
2. Use the "search_docs" tool to find version-specific migration information
3. Use the "list_versions" tool to see all available versions

Please help me with the migration process:

1. **Package Updates:**
   - Update ${frameworkInfo.packageName} to version ${targetVersion}
   - Update ag-grid-community/enterprise as needed
   - Handle peer dependency requirements

2. **Breaking Changes Analysis:**
   - Identify breaking changes between ${currentVersion} and ${targetVersion}
   - Review the AG Grid changelog and migration guide
   - Check for deprecated API usage

3. **Code Updates:**
   - Update imports: ${frameworkInfo.imports}
   - ${frameworkInfo.additional}
   - Update grid options and column definitions
   - Handle any API signature changes

4. **Testing & Validation:**
   - Test core grid functionality
   - Verify custom components still work
   - Check performance impact
   - Test with your existing data

5. **Framework-Specific Considerations:**
   ${framework === 'react' ? '- Check React version compatibility\n   - Update useEffect dependencies\n   - Review ref usage patterns' : ''}
   ${framework === 'angular' ? '- Update Angular module configuration\n   - Check injectable services\n   - Review component lifecycle methods' : ''}
   ${framework === 'vue' ? '- Update Vue component setup\n   - Check reactive data handling\n   - Review template syntax' : ''}
   ${framework === 'vanilla' ? '- Update DOM integration code\n   - Review event handling\n   - Check CSS/styling updates' : ''}

Please provide practical, working code examples for any changes needed, specific to ${framework} and the version upgrade from ${currentVersion} to ${targetVersion}.
`;

  return {
    description: `AG Grid ${framework} Migration Guide: ${currentVersion} → ${targetVersion}`,
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
