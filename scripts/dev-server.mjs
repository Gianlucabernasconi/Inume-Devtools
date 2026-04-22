import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = resolve(fileURLToPath(new URL('../', import.meta.url)))
const HOST = '127.0.0.1'
const PORT = 3000

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${HOST}:${PORT}`)
    const pathname = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname
    const relativePath = normalize(pathname).replace(/^\/+/, '')
    const filePath = resolve(ROOT_DIR, relativePath)

    if (!filePath.startsWith(ROOT_DIR)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Forbidden')
      return
    }

    const file = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store'
    })
    response.end(file)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
})

server.listen(PORT, HOST, () => {
  process.stdout.write(`Dev server running at http://${HOST}:${PORT}\n`)
})
