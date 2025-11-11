#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

function makeSkeleton(value) {
  if (typeof value === 'string') return ''
  if (Array.isArray(value)) {
    // For arrays of strings, produce array of empty strings with same length
    if (value.every((v) => typeof v === 'string')) return value.map(() => '')
    // For arrays of objects, map recursively
    return value.map(makeSkeleton)
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value)) {
      out[key] = makeSkeleton(value[key])
    }
    return out
  }
  return value
}

function main() {
  const [,, srcPath, outPath] = process.argv
  if (!srcPath || !outPath) {
    console.error('Usage: node scripts/gen-locale-skeleton.mjs <src-en.json> <out-locale.json>')
    process.exit(1)
  }
  const absSrc = path.resolve(srcPath)
  const absOut = path.resolve(outPath)
  const raw = fs.readFileSync(absSrc, 'utf8')
  const data = JSON.parse(raw)
  const skeleton = makeSkeleton(data)
  const json = JSON.stringify(skeleton, null, 2) + '\n'
  fs.writeFileSync(absOut, json, 'utf8')
  console.log(`Wrote skeleton to ${absOut}`)
}

main()
