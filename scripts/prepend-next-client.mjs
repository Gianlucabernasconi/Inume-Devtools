import { readFile, writeFile } from 'node:fs/promises'

const files = ['dist/next.js', 'dist/next.cjs']
const directive = '"use client";\n'

await Promise.all(
  files.map(async (file) => {
    const source = await readFile(file, 'utf8')
    if (source.startsWith(directive)) {
      return
    }

    await writeFile(file, `${directive}${source}`)
  })
)
