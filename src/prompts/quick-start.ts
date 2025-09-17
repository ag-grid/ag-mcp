import { GetPromptRequest, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { PromptDefinition } from "../utils/types";

const listing = {
    name: 'quick-start',
    description: 'Get started with AG-Grid in any framework',
    arguments: [
        {
            name: 'framework',
            description: 'Framework to use (react, angular, vue, javascript)',
            required: true
        },
        {
            name: 'projectType',
            description: 'Project type (new or existing)',
            required: false
        },
        {
            name: 'typescript',
            description: 'Use TypeScript (true/false)',
            required: false
        },
        {
            name: 'features',
            description: 'Comma-separated list of features to include',
            required: false
        }
    ]
}

async function handler(args: GetPromptRequest["params"]["arguments"]): Promise<GetPromptResult> {
  const framework = args?.framework || 'react';
  const projectType = args?.projectType || 'new';
  const typescript = args?.typescript === 'true';
  const features = args?.features ? args.features.split(',').map((f: string) => f.trim()) : [];

  const prompt = `
I want to get started with AG-Grid in a ${framework} ${projectType} project${typescript ? ' using TypeScript' : ''}${features.length > 0 ? ` with the following features: ${features.join(', ')}` : ''}.

**Important:** I have access to AG Grid MCP tools that can help with this setup:
1. Use "detect_version" tool to see if AG Grid is already installed in my project
2. Use "search_docs" tool to find specific documentation for ${framework}
3. Use "list_versions" tool to see available AG Grid versions
4. Browse AG Grid resources for ${framework}-specific articles and examples

Please help me with a complete setup guide:

1. **Installation & Dependencies:**
   - Install the correct AG Grid packages for ${framework}${typescript ? ' with TypeScript support' : ''}
   - Include any peer dependencies needed
   - Recommend the best version to use

2. **Basic Setup:**
   - Set up the basic grid configuration for ${framework}
   - Import required CSS files and themes
   - Create the initial grid component structure

3. **Sample Implementation:**
   - Create a working example with realistic sample data
   - Show proper ${typescript ? 'TypeScript' : 'JavaScript'} typing
   - Include error handling and best practices

4. **Core Features:**
   ${features.length > 0 ? 
     `- Implement the requested features: ${features.join(', ')}` : 
     '- Add essential features like sorting, filtering, and pagination'}
   - Show how to customize column definitions
   - Demonstrate data binding and updates

5. **Framework-Specific Integration:**
   ${framework === 'react' ? '- Proper React hooks usage\n   - Component lifecycle integration\n   - State management patterns' : ''}
   ${framework === 'angular' ? '- Angular service integration\n   - Module configuration\n   - Component communication patterns' : ''}
   ${framework === 'vue' ? '- Vue 3 composition API usage\n   - Reactive data handling\n   - Component organization' : ''}
   ${framework === 'vanilla' ? '- Pure JavaScript implementation\n   - DOM manipulation patterns\n   - Event handling setup' : ''}

6. **Next Steps:**
   - How to add more advanced features
   - Performance optimization tips
   - Links to relevant documentation sections

Please provide complete, copy-paste ready code examples that I can use immediately in my ${framework} project.`;

  return {
    description: `Quick start guide for AG-Grid with ${framework}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}

export const createQuickStartPrompt = (): PromptDefinition => {
  return {
    name: "quick-start",
    listing,
    handler
  }
}
