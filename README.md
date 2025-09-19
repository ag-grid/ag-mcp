# AG MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with framework and version specific knowledge to help developers integrate AG Grid into their applications.

## Installation

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-light.svg)](https://cursor.com/en/install-mcp?name=ag-mcp&config=eyJjb21tYW5kIjoibnB4IGFnLW1jcCJ9)

[![Install in VS Code]()](vscode:mcp/install?%7B%22ag-mcp%22%3A%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22ag-mcp%22%5D%7D%7D)


To install and use `ag-mcp` with your LLM client, simply provide the following command in the normal process for adding an MCP Server:

```npx ag-mcp```

For more information on how to add an MCP server to your LLM client, please use their documentation.

## Tools

- `search-docs` - Search the documents for the currently installed version of `ag-grid`.
- `detect-version` - Infers the version and framework of `ag-grid` installed in your repo.
- `set-version` - Manually set the version of you repo (useful in monorepos).

## Resources

- `docs` - Access to the full AG Grid documentation at the correct version.
- `examples` - A library of AG Grid implementation examples in you framework.

## Prompts

- `quick-start` - Get started with AG-Grid in any framework
- `upgrade_grid` - Migrate to a newer version of AG-Grid

## Usage

The server can be run using: `npx ag-mcp`

Config, such as project roots and versions, is stored in you cache folder. For example, in MacOS it will be stored in `~/Library/Preferences/ag-mcp`
