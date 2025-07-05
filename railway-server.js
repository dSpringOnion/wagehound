// Railway Docker-optimized server
console.log('🚀 RAILWAY DOCKER SERVER STARTING...');
console.log('📊 Node version:', process.version);
console.log('🖥️  Platform:', process.platform);
console.log('🔧 PORT env var:', process.env.PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

const http = require('http');

// Create server with proper Railway Docker handling
const server = http.createServer((req, res) => {
  console.log(`📥 ${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
  
  // Handle health checks specifically
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    console.log('✅ Health check response sent');
    return;
  }
  
  // Handle all other requests
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Powered-By': 'WageHound-Railway'
  });
  
  const response = {
    status: 'success',
    message: 'WageHound server is running!',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      port: process.env.PORT,
      node_env: process.env.NODE_ENV
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  };
  
  res.end(JSON.stringify(response, null, 2));
  console.log('✅ Response sent successfully');
});

// Railway Docker: Use PORT from environment or default to 3000
const port = parseInt(process.env.PORT) || 3000;
const host = '0.0.0.0'; // Important for Docker containers

console.log(`🎯 Starting server on ${host}:${port}`);

server.listen(port, host, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ Server successfully listening on ${host}:${port}`);
  console.log(`🏥 Health check available at: http://${host}:${port}/health`);
  console.log(`🌍 Server ready for Railway connections`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`🚫 Port ${port} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown for Docker
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received - graceful shutdown');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received - graceful shutdown');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});

// Keep process alive
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🔄 Server initialization complete');