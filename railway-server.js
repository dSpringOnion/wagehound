// Railway-specific server that tries multiple binding strategies
console.log('🚀 RAILWAY-SPECIFIC DEBUG SERVER STARTING...');
console.log('📊 Node version:', process.version);
console.log('🖥️  Platform:', process.platform);
console.log('🔧 PORT env var:', process.env.PORT);

const http = require('http');

// Create the most basic possible server
const server = http.createServer((req, res) => {
  console.log(`📥 REQUEST: ${req.method} ${req.url}`);
  
  // Always respond with 200 OK for any request
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(`OK - Server is working!\nTime: ${new Date().toISOString()}\nURL: ${req.url}\nMethod: ${req.method}`);
  
  console.log('✅ Response sent');
});

const port = parseInt(process.env.PORT) || 3000;

console.log(`🎯 Binding to port ${port}`);

// Railway-specific: Just bind to the port, let Railway handle the host
server.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
  console.log(`🌍 Railway should be able to connect now`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Prevent process from exiting
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received');
  server.close(() => process.exit(0));
});

console.log('🔄 Server setup complete');