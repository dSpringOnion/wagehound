const http = require('http');

const server = http.createServer((req, res) => {
  // Collect environment info
  const envInfo = {
    NODE_VERSION: process.version,
    PLATFORM: process.platform,
    ARCH: process.arch,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD,
    HOME: process.env.HOME,
    PATH: process.env.PATH ? 'SET' : 'NOT SET',
    // Don't log sensitive env vars, just check if they exist
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    RAILWAY_ENV: process.env.RAILWAY_ENVIRONMENT || 'NOT SET',
    MEMORY_USAGE: process.memoryUsage(),
    UPTIME: process.uptime(),
  };

  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify(envInfo, null, 2));
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

server.listen(port, host, () => {
  console.log(`🔍 Debug server running on ${host}:${port}`);
  console.log(`📊 Node.js version: ${process.version}`);
  console.log(`🖥️  Platform: ${process.platform}`);
  console.log(`⚡ Memory usage:`, process.memoryUsage());
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});