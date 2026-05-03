// =====================================================================
//  routes/site.js — endpoints PÚBLICOS de configuração / conteúdo
//
//  GET  /api/site-config   → retorna TUDO de site_settings (frete, hero,
//                            banners, topbar, instagram, footer, etc.)
//  POST /api/newsletter    → cadastra e-mail no newsletter
// =====================================================================

import { Router } from 'express'
import { pool } from '../db/db.js'

const router = Router()

router.get('/site-config', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM site_settings')
    const out = {}
    for (const r of rows) {
      out[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value
    }
    res.json(out)
  } catch (err) { next(err) }
})

router.post('/newsletter', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' })
    }
    await pool.query(
      `INSERT INTO newsletter_subscribers (email) VALUES (?)
       ON DUPLICATE KEY UPDATE email = email`,
      [email]
    )
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

export default router
