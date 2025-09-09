#!/usr/bin/env node
import { AgMcpServer } from './server.js';

const server = new AgMcpServer("https://grid-staging.ag-grid.com/");
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});