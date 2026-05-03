// =====================================================================
//  routes/upload.js — POST /api/admin/upload
//  multipart/form-data com campo "file" → salva em backend/uploads/
//  retorna { url: "/uploads/<nome-aleatorio>.jpg" }
// =====================================================================

import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads')

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg'
    const name = crypto.randomBytes(12).toString('hex') + ext
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },   // 8 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'))
    }
    cb(null, true)
  },
})

const router = Router()

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  // URL relativa — o front pode prefixar com VITE_API_URL ou usar absoluta
  res.status(201).json({
    url:      `/uploads/${req.file.filename}`,
    fileName: req.file.filename,
    size:     req.file.size,
  })
})

router.delete('/upload/:fileName', (req, res, next) => {
  try {
    const file = path.join(UPLOAD_DIR, path.basename(req.params.fileName))
    if (!file.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: 'caminho inválido' })
    if (fs.existsSync(file)) fs.unlinkSync(file)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
