#!/usr/bin/env node
import { createAgMcpServer } from './server.js';

const { run } = createAgMcpServer();
run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});