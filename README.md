# AG Grid Model Context Protocol (MCP) Server

AG Grid's Model Context Protocol (MCP) server provides AI Agents with framework and version specific knowledge to help developers integrate and maintain their AG Grid code.

## Overview

The `ag-mcp` server works with any LLM that supports MCPs, and provides tools to allow LLMS to lookup framework and version specific documentation, examples, and references to help create, modify, maintain, and upgrade your data grid code.

### Architecture Diagram

```mermaid
flowchart LR
    subgraph LLM["LLM Providers"]
        A1[Claude]
        A2[ChatGPT]
        A3[Gemini]
        A4[...]
    end

    subgraph Developer["Developer"]
        D[Developer]
    end

    subgraph MCP_Client["MCP Clients"]
        direction RL
        B1[Claude Code]
        B2[Copilot]
        B3[Windsurf]
        B4[Cursor]
        B5[...]
    end

    subgraph ag-mcp["AG Grid MCP Server"]
        subgraph Tools["Tools"]
            C1[Detect / Set Version]
            C2[Search AG Grid Docs]
        end

        C3[AG Grid Docs & Examples]

        subgraph Prompts["Prompts"]
            C4[Bootstrap Grid]
            C5[Upgrade Grid]
        end
    end

    %% Connections
    A1 --> MCP_Client
    A2 --> MCP_Client
    A3 --> MCP_Client
    A4 --> MCP_Client

    D --> MCP_Client

    MCP_Client --> C1
    MCP_Client --> C2
    MCP_Client --> C3
    MCP_Client --> C4
    MCP_Client --> C5

    C1 --> MCP_Client
    C2 --> MCP_Client
    C3 --> MCP_Client
    C4 --> MCP_Client
    C5 --> MCP_Client

    %% Styling
    classDef llmStyle fill:#e1f5fe,stroke:#0288d1,stroke-width:3px,color:#01579b
    classDef clientStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#4a148c
    classDef toolStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100
    classDef promptStyle fill:#e8f5e9,stroke:#43a047,stroke-width:2px,color:#1b5e20
    classDef docStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f
    classDef developerStyle fill:#e0f2f1,stroke:#00897b,stroke-width:3px,color:#004d40
    classDef serverStyle fill:#fff8e1,stroke:#ffa000,stroke-width:4px,color:#ff6f00

    class A1,A2,A3,A4 llmStyle
    class B1,B2,B3,B4,B5 clientStyle
    class C1,C2 toolStyle
    class C4,C5 promptStyle
    class C3 docStyle
    class D developerStyle
    class ag-mcp serverStyle

    %% Link styling
    linkStyle default stroke:#666,stroke-width:2px,fill:none

```

## Installation

To install and use `ag-mcp` with your LLM client, simply provide the following command in the normal process for adding an MCP Server:

`npx ag-mcp`

### Claude Code

TODO: Install Button

TODO: Some description of install process

```bash
claude mcp add ag-mcp npx ag-mcp
```

To learn more, see the [Claude MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp)

### VS Code (Copilot)

TODO: Install Button

dd the following to your .vscode/mcp.json file in your workspace.

```bash
"ag-mcp": {
    "type": "stdio",
    "command": "npx",
    "args": [
        "ag-mcp@0.0.1-beta.1",
        "${input:stdio-arg}"
    ],
    "env": {}
}
```

To learn more, see the [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

### Cursor

TODO: Install Button

If it doesn't already exist, create the file mcp.json in the root of your project. Then add the following:

```json
{
  "mcpServers": {
    "ag-mcp": {
      "command": "npx",
      "args": ["ag-mcp"]
    }
  }
}
```

To learn more, see the [Cursor MCP documentation](https://cursor.com/docs/context/mcp)

## Usage

The server can be run using: `npx ag-mcp`

Config, such as project roots and versions, is stored in you cache folder. For example, in MacOS it will be stored in `~/Library/Preferences/ag-mcp`

TODO: More info on how to use the prompts, tools, resources

## Tools

Tools are schema-defined interfaces that enable AI models to perform actions. Each tool defines a specific operation with typed inputs and outputs, and the model automatically requests tool execution based on context.

Tools can be called manually by entering the tool name as a prompt into your LLM, and passing the relevant params. Refer to your LLM documentation for accessing resources in Claude, Windsurf, VS Code, and Cursor, etc...

AG-MCP currently provides four tools:

- [`search_docs`]() - Search the documents for the currently installed version of AG Grid.
- [`detect_version`]() - Infers the version and framework of AG Grid installed in your repo.
- [`set_version`]() - Manually set the version of you repo (useful in monorepos).
- [`list_versions`]() - List all available AG Grid versions from the API to see what versions are available for migration or reference.

### Search Docs

Search AG Grid documentation for the detected or latest version. Use this to find details on features, APIs, configurations, and troubleshooting. Supports natural language queries.

### Parameters

| Name      | Type   | Required | Description                                                                           |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------- |
| query     | string | Yes      | Search term (e.g., `"column sorting"`, `"cell renderers"`, `"data grid performance"`) |
| version   | string | No       | Override the detected AG Grid version                                                 |
| framework | string | No       | Override the detected framework                                                       |

### Detect Version

Detect the AG Grid version and framework in the current project by analyzing package.json and dependencies. Use this to understand the project setup.

### Parameters

| Name | Type   | Required | Description                                                   |
| ---- | ------ | -------- | ------------------------------------------------------------- |
| path | string | No       | Path to the project directory (defaults to current workspace) |

### Set Version

Set the AG Grid version and framework to use for documentation searches and resources. Use this when working with a specific version or framework combination.

### Parameters

| Name      | Type   | Required | Description                                                               |
| --------- | ------ | -------- | ------------------------------------------------------------------------- |
| version   | string | Yes      | AG Grid version to use (e.g., `"34.1.0"`)                                 |
| framework | string | Yes      | Framework to use for documentation (`react`, `angular`, `vue`, `vanilla`) |

## Resources

Resources can be used to provide additional context to the LLM, such as an example, docs page, or API reference.

- `articles` - Access to the full AG Grid documentation at the correct version.
- `definitions` - API definitions and interfaces
- `examples` - A library of AG Grid implementation examples in you framework.

Refer to your LLM documentation for accessing resources in Claude, Windsurf, VS Code, and Cursor, etc...

### Documentation Search

The core feature of the AG MCP Server is an LLM optimized search tool (`articles`) which will provide documentation, examples, API definitions and references.

Your LLM can choose to use this tool whenever it needs more information on how to implement AG Grid features. The content is provided in a condensed markdown so as to minimise the amount of context used, and not overwhelm the LLM.

## Prompts

Prompts are pre-configured actions that allow you to perform common actions, such as creating a new grid, or migrating to a later version.

- `quick-start` - Get started with AG-Grid in any framework
- `upgrade_grid` - Migrate to a newer version of AG-Grid

### Quick Start

The `quick-start` prompt can be triggered directly from your LLM client. This creates a list of instructions for you LLM to follow when creating a new AG Grid project or adding AG Grid to an existing project.

You can pass additional context, requirements or instructions to your LLM as arguments to this prompt to fine tune the type of data grid you want the LLM to create.

### Migrations & Upgrades

The `upgrade_grid` prompt creates a step by step plan to help migrate from your current version to the provided version. This is given to the LLM to execute, calling back to the MCP server as needed. It takes a version by version approach, making sure each version is correct before continuing.
