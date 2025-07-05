const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body>
        <h1>🎉 WageHound Server is ALIVE!</h1>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Request: ${req.method} ${req.url}</p>
        <p>If you see this, the server is working!</p>
      </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${port}`);
  console.log(`🌍 Accessible at http://0.0.0.0:${port}`);
});