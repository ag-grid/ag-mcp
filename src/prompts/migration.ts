import {
  ErrorCode,
  GetPromptRequest,
  GetPromptResult,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { PromptDefinition } from "../utils/types";
import { 
  detectAndSetProject, 
  getCurrentProject
} from "../state/project.js";
import { Semver } from "../utils/semver.js";

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
  
  // Auto-detect current project version and framework
  let currentProject = getCurrentProject();
  if (!currentProject) {
    const detected = await detectAndSetProject(process.cwd());
    currentProject = detected || undefined;
  }
  
  const currentVersion = args.currentVersion || (currentProject?.version) || "unknown";
  const framework = args.framework || (currentProject?.framework) || "react";
  
  // Parse versions and generate migration path using semver utility
  let currentMajorVersion = 0;
  let targetMajorVersion = 0;
  let migrationPath: number[] = [];
  let isMultiStepMigration = false;
  
  if (currentVersion !== "unknown") {
    try {
      const currentVer = Semver.parse(currentVersion);
      const targetVer = Semver.parse(targetVersion);
      
      currentMajorVersion = currentVer.major;
      targetMajorVersion = targetVer.major;
      
      migrationPath = Semver.generateMajorVersionPath(currentVersion, targetVersion);
      isMultiStepMigration = migrationPath.length > 1;
    } catch (error) {
      // Fallback to simple parsing if semver fails
      const currentMatch = currentVersion.match(/^v?(\d+)/);
      const targetMatch = targetVersion.match(/^v?(\d+)/);
      
      currentMajorVersion = currentMatch ? parseInt(currentMatch[1], 10) : 0;
      targetMajorVersion = targetMatch ? parseInt(targetMatch[1], 10) : 0;
      
      for (let v = currentMajorVersion + 1; v <= targetMajorVersion; v++) {
        migrationPath.push(v);
      }
      isMultiStepMigration = migrationPath.length > 1;
    }
  }
  
  const nextMajorVersion = migrationPath[0];

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

  let prompt: string;
  
  if (currentVersion === "unknown") {
    prompt = `
I want to upgrade my AG Grid ${framework} project to version ${targetVersion}, but no current version was detected.

**⚠️ Version Detection Required:**
Please run the \`detect_version\` tool first to identify your current AG Grid installation before proceeding with migration guidance.

If detection fails, you can:
1. Check your package.json for AG Grid dependencies
2. Use the \`set_version\` tool to manually specify your current version
3. Provide the current version when calling this migration prompt again

**Important Migration Notes:**
- **DO NOT use codemods** - they may introduce breaking changes or incompatibilities
- Always follow the official AG Grid upgrade guides step by step
- For major version upgrades, migrate one major version at a time
- Consult the resource: \`ag-mcp://articles/upgrading-to-ag-grid-${targetMajorVersion}\` for specific upgrade instructions

Once your current version is detected, re-run this migration prompt for detailed upgrade guidance.
`;
  } else if (isMultiStepMigration) {
    prompt = `
I want to upgrade my AG Grid ${framework} project from v${currentVersion} to v${targetVersion}.

**🚨 IMPORTANT: Multi-Step Migration Required**

Your upgrade spans multiple major versions. For safety and compatibility, you should migrate **one major version at a time**:

**Migration Path:** v${currentMajorVersion} → ${migrationPath.map(v => `v${v}`).join(' → ')}

**Next Step: Upgrade to v${nextMajorVersion}**

1. **DO NOT use codemods** - they may introduce breaking changes
2. **Follow the official upgrade guide:** \`ag-mcp://articles/upgrading-to-ag-grid-${nextMajorVersion}\`
3. **Package Updates for v${nextMajorVersion}:**
   - Update ${frameworkInfo.packageName} to latest v${nextMajorVersion}.x
   - Update ag-grid-community/enterprise to matching version
   
4. **Breaking Changes:**
   - Consult \`ag-mcp://articles/upgrading-to-ag-grid-${nextMajorVersion}\` for all breaking changes
   - Test thoroughly before proceeding to next major version
   
5. **Framework-Specific Updates (${framework}):**
   ${frameworkInfo.additional}
   
6. **After v${nextMajorVersion} is working:**
   - Run tests and verify functionality
   - Only then proceed to upgrade to v${migrationPath[1] || targetMajorVersion}

**⚠️ Do not attempt to jump directly to v${targetMajorVersion} - migrate step by step for best results.**

Would you like me to help with the v${currentMajorVersion} → v${nextMajorVersion} upgrade first?
`;
  } else {
    prompt = `
I want to upgrade my AG Grid ${framework} project from v${currentVersion} to v${targetVersion}.

**Migration Guide: v${currentMajorVersion} → v${targetMajorVersion}**

**🚨 IMPORTANT MIGRATION RULES:**
1. **DO NOT use codemods** - they may introduce breaking changes or incompatibilities
2. **Follow official upgrade guide:** \`ag-mcp://articles/upgrading-to-ag-grid-${targetMajorVersion}\`
3. **Manual migration only** - use the specific changes documented in the upgrade resource

**Step-by-Step Migration Process:**

1. **Review Breaking Changes:**
   - Consult \`ag-mcp://articles/upgrading-to-ag-grid-${targetMajorVersion}\` for complete list
   - Identify which changes affect your codebase
   - Plan your migration approach

2. **Package Updates:**
   - Update ${frameworkInfo.packageName} to version ${targetVersion}
   - Update ag-grid-community/enterprise to matching version
   - Handle any peer dependency requirements

3. **Code Updates (${framework}):**
   - Update imports: ${frameworkInfo.imports}
   - ${frameworkInfo.additional}
   - Apply changes from \`ag-mcp://articles/upgrading-to-ag-grid-${targetMajorVersion}\` resource
   - Update grid options and column definitions as specified

4. **Testing & Validation:**
   - Test all grid functionality
   - Verify custom components work correctly
   - Check for console warnings/errors
   - Performance testing with your data

**Framework-Specific Considerations (${framework}):**
${framework === 'react' ? '- React version compatibility\n- useEffect dependencies\n- Ref usage patterns\n- Component prop changes' : ''}${framework === 'angular' ? '- Angular module configuration\n- Injectable services\n- Component lifecycle methods\n- Template updates' : ''}${framework === 'vue' ? '- Vue component setup\n- Reactive data handling\n- Template syntax\n- Composition API changes' : ''}${framework === 'vanilla' ? '- DOM integration updates\n- Event handling changes\n- CSS/styling updates\n- Grid creation API' : ''}

**Next Steps:**
1. Consult \`ag-mcp://articles/upgrading-to-ag-grid-${targetMajorVersion}\` for detailed changes
2. Apply changes manually (no codemods)
3. Test thoroughly before considering migration complete

Need help with any specific migration step or breaking change?
`;
  }

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
