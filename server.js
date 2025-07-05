// Railway-persistent server with diagnostic info
const http = require('http');

console.log('🚀 Starting WageHound server...');
console.log('📊 Node:', process.version);
console.log('🔧 PORT:', process.env.PORT);

let requestCount = 0;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  requestCount++;
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  console.log(`📥 Request #${requestCount}: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    console.log(`✅ Health check response sent (uptime: ${uptime}s)`);
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>WageHound - Railway Deployment</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>🎉 WageHound is Successfully Running on Railway!</h1>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
          <h3>📊 Server Status:</h3>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Uptime:</strong> ${uptime} seconds</p>
          <p><strong>Requests served:</strong> ${requestCount}</p>
          <p><strong>Port:</strong> ${process.env.PORT}</p>
          <p><strong>Node version:</strong> ${process.version}</p>
          <p><strong>Platform:</strong> ${process.platform}</p>
          <p><strong>Memory usage:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="/health" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Health Check</a>
        </div>
        <div style="margin-top: 20px; color: #666;">
          <p>✅ Server is working correctly</p>
          <p>✅ Health checks are responding</p>
          <p>✅ Ready for application deployment</p>
        </div>
      </body>
    </html>
  `);
  
  console.log(`✅ Response sent for ${req.url}`);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌍 Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check available at http://0.0.0.0:${PORT}/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Log every 30 seconds to show the server is alive
const keepAliveInterval = setInterval(() => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  console.log(`💓 Server alive - uptime: ${uptime}s, requests: ${requestCount}`);
}, 30000);

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received - shutting down gracefully');
  clearInterval(keepAliveInterval);
  server.close(() => {
    console.log('🔚 Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received - shutting down gracefully');
  clearInterval(keepAliveInterval);
  server.close(() => {
    console.log('🔚 Server closed successfully');
    process.exit(0);
  });
});

console.log('🔄 Server initialization complete - ready for requests!');