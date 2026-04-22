export function sanitizeDownloadFilename(baseName: string | undefined, extension: 'css' | 'json'): string {
  const normalized = (baseName ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

  const safeBase = normalized || 'css-vars-devtools-export'
  return `${safeBase}.${extension}`
}

interface DownloadOptions {
  content: string
  baseName?: string
  extension: 'css' | 'json'
  mimeType: string
  currentWindow: Window
  currentDocument: Document
}

export function triggerDownload(options: DownloadOptions): void {
  const urlApi = URL
  const objectUrl = urlApi.createObjectURL(new Blob([options.content], { type: options.mimeType }))
  const anchor = options.currentDocument.createElement('a')

  anchor.href = objectUrl
  anchor.download = sanitizeDownloadFilename(options.baseName, options.extension)
  anchor.style.display = 'none'

  options.currentDocument.body.append(anchor)
  anchor.click()
  anchor.remove()

  options.currentWindow.setTimeout(() => {
    urlApi.revokeObjectURL(objectUrl)
  }, 0)
}
