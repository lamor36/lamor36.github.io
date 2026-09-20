import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
const port = process.env.PORT || 4173;

http
  .createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(dist, path.normalize(p));
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(port, () => console.log(`http://localhost:${port}`));
