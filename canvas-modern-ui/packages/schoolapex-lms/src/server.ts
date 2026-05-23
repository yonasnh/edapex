import http from 'http';

const port = 4003;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({
    message: "SchoolApex LMS GraphQL API is integrated. Please use Canvas Rails on Port 3000.",
    status: "integrated",
    timestamp: new Date().toISOString()
  }));
});

server.listen(port, () => {
  console.log(`Mock SchoolApex LMS API listening on port ${port}`);
});
