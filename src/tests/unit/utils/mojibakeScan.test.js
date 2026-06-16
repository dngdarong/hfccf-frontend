import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const EXCLUDED_DIRS = new Set(['.git', 'dist', 'node_modules', 'coverage'])
const TEXT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.json', '.css', '.html', '.md', '.yml', '.yaml'])
const MOJIBAKE_MARKERS = new RegExp(
  [
    String.fromCharCode(0x00e2),
    `${String.fromCharCode(0x00e1)}${String.fromCharCode(0x0178)}`,
    `${String.fromCharCode(0x00e1)}${String.fromCharCode(0x017e)}`,
    String.fromCharCode(0x00c3),
    String.fromCharCode(0xfffd),
  ].join('|'),
  'u',
)

async function collectTextFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') && EXCLUDED_DIRS.has(entry.name)) {
      continue
    }

    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      files.push(...(await collectTextFiles(fullPath)))
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (TEXT_EXTENSIONS.has(extension)) {
      files.push(fullPath)
    }
  }

  return files
}

describe('mojibake scan', () => {
  it('does not contain corrupted Khmer markers in repository text files', async () => {
    const files = await collectTextFiles(ROOT_DIR)
    const offendingFiles = []

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8')
      if (MOJIBAKE_MARKERS.test(content)) {
        offendingFiles.push(path.relative(ROOT_DIR, file))
      }
    }

    expect(offendingFiles).toEqual([])
  })
})
