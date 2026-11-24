/**
 * 部品の見本を配る開発用のサーバー。node scripts/serve.ts [--port 5190]
 * リポジトリの根を配る（見本は /gallery/、CSS は /css/）。127.0.0.1 だけで待つ。配るのは GET だけ
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: { port: { type: "string", default: "5190" } } });
const root = fileURLToPath(new URL("..", import.meta.url));
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  const file = normalize(join(root, path.endsWith("/") ? path + "index.html" : path));
  if (req.method !== "GET" || !file.startsWith(root) || file.split(sep).includes("node_modules")) {
    res.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(values.port), "127.0.0.1", () => console.log(`http://127.0.0.1:${values.port}/gallery/`));
