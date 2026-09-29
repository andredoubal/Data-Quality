// Turns the single-file build (dist-single/index.html) into a body-only page for hosts
// that supply their own <html>/<head>/<body> skeleton.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const html = readFileSync('dist-single/index.html', 'utf8')
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1]
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1]
const keep = head.replace(/<meta[^>]*>\s*/gi, '')
mkdirSync('artifact', { recursive: true })
writeFileSync('artifact/data-quality-academy.html', keep.trim() + '\n' + body.trim() + '\n')
console.log('wrote artifact/data-quality-academy.html')
