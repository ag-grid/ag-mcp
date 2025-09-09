# AG-Grid MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with AG-Grid specific tools and knowledge to help developers integrate AG-Grid into their applications.

## Features

- **Framework-aware**: Supports React, Angular, Vue, and Vanilla JavaScript
- **Version-aware**: Provides version-specific documentation and examples
- **Documentation access**: Uses the correct version of documentation
- **Feature assistance**: Helps implement common and complex AG-Grid features

## Tools

- `search-docs` - Search the documents for the currently installed version of `ag-grid`

## Resources

- `docs` - Access to version-specific documentation
- `examples` - Framework-specific code examples
- `migration-guides` - Version migration assistance

## Prompts

- `quick-start` - Get started with AG-Grid in any framework
- `migrate` - Migrate to a newer version of AG-Grid
- `troubleshooting` - Debug common issues

## Usage

The server can be run using: `npx ag-mcp`

Config, such as project roots and versions, is stored in you cache folder. For example, in MacOS it will be stored in `~/Library/Preferences/ag-mcp`

## Development

Run in development mode:
```bash
npm run dev
```

Run tests:
```bash
npm test
```