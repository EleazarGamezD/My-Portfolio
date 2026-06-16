const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'dist', 'Portfolio_frontend_v2', 'browser');
const port = Number(process.argv[2] || 4215);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function resolveFile(urlPath) {
  const normalizedPath = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const fallback = path.join(root, 'es', 'index.html');
  let file = path.join(root, normalizedPath || 'es/index.html');

  if (!file.startsWith(root)) {
    return fallback;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  if (fs.existsSync(file)) {
    return file;
  }

  return fallback;
}

http
  .createServer((req, res) => {
    const file = resolveFile(new URL(req.url, `http://localhost:${port}`).pathname);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'content-type': mime[ext] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`portfolio static server http://127.0.0.1:${port}`);
  });
