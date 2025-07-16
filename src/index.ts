import { AgMcpServer } from './server';

const server = new AgMcpServer("https://grid-staging.ag-grid.com/");
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});