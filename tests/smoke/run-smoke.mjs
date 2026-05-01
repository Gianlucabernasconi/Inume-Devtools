import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const ROOT_DIR = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const HOST = '127.0.0.1'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
}

async function main() {
  const { server, baseUrl } = await startStaticServer()
  const browser = await chromium.launch()
  const context = await browser.newContext({
    acceptDownloads: true,
    baseURL: baseUrl
  })

  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl })

  const page = await context.newPage()
  page.on('pageerror', (error) => {
    process.stderr.write(`Page error: ${error.message}\n`)
  })

  try {
    await page.goto('/examples/vanilla/', { waitUntil: 'networkidle' })

    await smokeDiscovery(page)
    await smokeCopy(page)
    await smokeDownload(page)
    await smokeOverlayBasics(page)

    process.stdout.write('Smoke tests passed in real browser.\n')
  } finally {
    await context.close()
    await browser.close()
    await new Promise((resolvePromise, rejectPromise) => {
      server.close((error) => {
        if (error) {
          rejectPromise(error)
          return
        }

        resolvePromise(undefined)
      })
    })
  }
}

async function smokeDiscovery(page) {
  await assertText(page, '#browser-status', 'Browser entry loaded through dynamic import.')

  const overlay = page.locator('[data-inume-css-vars-devtool-root="true"]')

  await overlay.locator('.toggle-button').click()
  await overlay.locator('.panel').waitFor({ state: 'visible' })

  const selectedName = (await overlay.locator('.selected-name').textContent())?.trim()
  assert.equal(selectedName, '--bg-page')

  const visibleRows = await overlay.locator('.row-button').count()
  assert.ok(visibleRows >= 4, 'Expected discovered vars to appear in overlay list')
}

async function smokeCopy(page) {
  await page.locator('#copy-css-btn').click()

  await page.waitForFunction(async () => {
    const text = await navigator.clipboard.readText()
    return text.includes(':root {') && text.includes('--color-base')
  })
}

async function smokeDownload(page) {
  const overlay = page.locator('[data-inume-css-vars-devtool-root="true"]')
  await overlay.locator('.close-button').click()
  await overlay.locator('.panel').waitFor({ state: 'hidden' })

  const downloadPromise = page.waitForEvent('download')
  await page.locator('#download-css-btn').click()
  const download = await downloadPromise

  assert.equal(download.suggestedFilename(), 'vanilla-sample.css')
}

async function smokeOverlayBasics(page) {
  const overlay = page.locator('[data-inume-css-vars-devtool-root="true"]')
  await overlay.locator('.toggle-button').click()
  await overlay.locator('.panel').waitFor({ state: 'visible' })

  await overlay.locator('.search input').fill('text-primary')

  const rows = await overlay.locator('.row-button .row-name').allTextContents()
  assert.deepEqual(rows.map((value) => value.trim()), ['--color-text-primary'])

  await overlay.locator('.close-button').click()
  await overlay.locator('.panel').waitFor({ state: 'hidden' })
}

async function assertText(page, selector, expectedText) {
  await page.waitForFunction(
    ({ selector: currentSelector, expectedText: currentExpectedText }) => {
      const element = document.querySelector(currentSelector)
      return element?.textContent?.trim() === currentExpectedText
    },
    { selector, expectedText }
  )
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const address = server.address()
      const currentPort = typeof address === 'object' && address ? address.port : 0
      const url = new URL(request.url ?? '/', `http://${HOST}:${currentPort}`)
      const pathname = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname
      const relativePath = normalize(pathname).replace(/^\/+/, '')
      const filePath = resolve(ROOT_DIR, relativePath)

      if (!filePath.startsWith(ROOT_DIR)) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }

      const file = await readFile(filePath)
      const extension = extname(filePath)
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
        'Cache-Control': 'no-store'
      })
      response.end(file)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
    }
  })

  await new Promise((resolvePromise, rejectPromise) => {
    server.listen(0, HOST, (error) => {
      if (error) {
        rejectPromise(error)
        return
      }

      resolvePromise(undefined)
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('No se pudo resolver el puerto del servidor de smoke tests.')
  }

  return {
    server,
    baseUrl: `http://${HOST}:${address.port}`
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
