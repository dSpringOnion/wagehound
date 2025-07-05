// Ultra-simple Railway server
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body>
        <h1>🎉 WageHound is LIVE!</h1>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Port: ${process.env.PORT}</p>
        <p>Node: ${process.version}</p>
        <a href="/health">Health Check</a>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => process.exit(0));
});