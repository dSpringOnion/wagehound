// Ultra-robust debug server for Railway deployment
console.log('🚀 STARTING DEBUG SERVER...');
console.log('📊 Node version:', process.version);
console.log('🖥️  Platform:', process.platform);
console.log('🔧 PORT env var:', process.env.PORT);

const http = require('http');

// Create server with extensive error handling
const server = http.createServer((req, res) => {
  console.log(`📥 Request: ${req.method} ${req.url} from ${req.headers['user-agent']}`);
  
  try {
    // Simple health check response for any request
    if (req.url === '/health' || req.url === '/_health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      console.log('✅ Health check response sent');
      return;
    }
    
    const envInfo = {
      status: 'SERVER_WORKING',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      port_env: process.env.PORT,
      node_env: process.env.NODE_ENV,
      railway_env: process.env.RAILWAY_ENVIRONMENT,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      request_headers: req.headers,
      url: req.url,
      method: req.method
    };

    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    
    res.end(JSON.stringify(envInfo, null, 2));
    console.log('✅ Response sent successfully');
    
  } catch (error) {
    console.error('❌ Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + error.message);
  }
});

// Error handlers for server
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`🚫 Port ${port} is already in use`);
  }
});

server.on('listening', () => {
  console.log(`✅ Server successfully listening on ${host}:${port}`);
  console.log(`🌍 Server should be accessible externally`);
});

// Try multiple port binding strategies
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log(`🎯 Attempting to bind to ${host}:${port}`);

// Listen with callback to catch immediate errors
server.listen(port, host, (error) => {
  if (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
  console.log(`🎉 SUCCESS! Server is running on ${host}:${port}`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});

console.log('🔄 Server setup complete, waiting for connections...');