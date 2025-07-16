import { GetPromptRequest, GetPromptResult } from "@modelcontextprotocol/sdk/types";
import { PromptDefinition } from "../utils/types";
import { Workspace } from "../workspace";

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

Please help me:
1. Set up the basic grid configuration
2. Install the necessary dependencies
3. Import required CSS files
4. Create a simple example with sample data
5. ${features.length > 0 ? `Add the requested features: ${features.join(', ')}` : 'Show me how to add common features like sorting and filtering'}

I'm looking for practical, working code examples that I can copy and use directly in my project.`;

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

export const createQuickStartPrompt = (workspace: Workspace): PromptDefinition => {
  return {
    name: "quick-start",
    listing,
    handler
  }
}
