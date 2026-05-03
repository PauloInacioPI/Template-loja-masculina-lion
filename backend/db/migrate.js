// Roda todas as migrations *.sql na pasta db/
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const files = fs.readdirSync(__dirname)
    .filter((f) => f.startsWith('migration-') && f.endsWith('.sql'))
    .sort()
  for (const f of files) {
    const sql = fs.readFileSync(path.join(__dirname, f), 'utf8')
    const stmts = sql.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('--'))
    for (const s of stmts) {
      await pool.query(s)
    }
    console.log(`✓ ${f}`)
  }
  await pool.end()
}

run().catch((e) => { console.error(e); process.exit(1) })
