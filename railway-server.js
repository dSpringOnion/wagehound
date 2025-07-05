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
  console.log(`🔍 User-Agent: ${req.headers['user-agent']}`);
  console.log(`🔍 Host: ${req.headers.host}`);
  
  // Set Railway-friendly headers immediately
  res.setHeader('X-Powered-By', 'WageHound-Railway');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    console.log('✅ OPTIONS preflight response sent');
    return;
  }
  
  // Handle health checks specifically
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    console.log('✅ Health check response sent');
    return;
  }
  
  // Handle root path with HTML
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WageHound - Railway Success</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5;">
        <h1 style="color: #333;">🎉 WageHound Successfully Deployed!</h1>
        <p style="color: #666; font-size: 18px;">Your application is running on Railway.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Server Status:</h3>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Node:</strong> ${process.version}</p>
          <p><strong>Platform:</strong> ${process.platform}</p>
          <p><strong>Port:</strong> ${process.env.PORT}</p>
        </div>
        <a href="/health" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Health Check</a>
      </body>
      </html>
    `);
    console.log('✅ HTML root response sent');
    return;
  }
  
  // Handle all other requests
  res.writeHead(200, { 
    'Content-Type': 'application/json'
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