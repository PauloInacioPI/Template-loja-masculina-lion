// =====================================================================
//  server.js — Ponto de entrada do backend Lion Modas
//
//  Fluxo:
//  1. Carrega variáveis de ambiente (.env)
//  2. Cria a aplicação Express
//  3. Aplica MIDDLEWARES (camadas que processam toda requisição)
//  4. Define ROTAS
//  5. Sobe o servidor na porta configurada
// =====================================================================

import 'dotenv/config'                       // 1. carrega .env em process.env
import express from 'express'                // 2. framework HTTP (default export)
import cors from 'cors'                      // 3. libera chamadas do front
import { pool, testConnection } from './db/db.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import adminRouter from './routes/admin.js'
import siteRouter from './routes/site.js'
import uploadRouter from './routes/upload.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()                                       // cria a aplicação
const PORT = Number(process.env.PORT) || 3001               // porta vem do .env

// ---------------------------------------------------------------------
//  MIDDLEWARES
//  Funcionam como filtros: toda requisição passa por eles antes de chegar
//  na rota final. A ORDEM importa.
// ---------------------------------------------------------------------

// CORS: libera o front (Vite em http://localhost:5173) a chamar este backend.
// Sem isso, o navegador bloqueia (política same-origin).
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

// Permite ler JSON no body das requests (POST/PUT/PATCH)
app.use(express.json({ limit: '1mb' }))

// Serve a pasta de uploads como /uploads (com cache leve)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  fallthrough: true,
}))

// Log simples de cada request — útil enquanto desenvolve
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()  // chama o próximo middleware/rota. ESQUECER ISSO trava a request.
})

// ---------------------------------------------------------------------
//  ROTAS
// ---------------------------------------------------------------------

// Rota raiz — só pra confirmar que o servidor responde
app.get('/', (_req, res) => {
  res.json({
    name: 'Lion Modas API',
    version: '0.1.0',
    healthcheck: '/health'
  })
})

// Healthcheck — confirma servidor + banco OK
app.get('/health', async (_req, res) => {
  try {
    const ok = await testConnection()
    res.json({
      status: 'ok',
      database: ok ? 'connected' : 'unreachable',
      uptime: Math.round(process.uptime()) + 's'
    })
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'down',
      error: err.message
    })
  }
})

// Rotas de produtos — tudo que começa com /api/products é tratado pelo router
app.use('/api/products', productsRouter)

// Rotas de pedidos
app.use('/api/orders', ordersRouter)

// Rotas administrativas (futuramente protegidas por JWT)
app.use('/api/admin', adminRouter)
app.use('/api/admin', uploadRouter)

// Rotas públicas de configuração (site-config) e newsletter
app.use('/api', siteRouter)

// 404 — qualquer rota não definida cai aqui
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url })
})

// Tratamento global de erros (4 parâmetros — Express identifica pela aridade)
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

// ---------------------------------------------------------------------
//  SUBIDA DO SERVIDOR
// ---------------------------------------------------------------------
async function start() {
  try {
    const ok = await testConnection()
    if (!ok) throw new Error('SELECT 1 não retornou 1')
    console.log('✓ Banco conectado:', process.env.DB_NAME)
  } catch (err) {
    console.error('✗ Falha ao conectar no banco:', err.message)
    process.exit(1)   // encerra o processo se nem conseguir falar com o banco
  }

  app.listen(PORT, () => {
    console.log(`✓ Lion Modas API rodando em http://localhost:${PORT}`)
    console.log(`  Tente: http://localhost:${PORT}/health`)
  })
}

// Encerramento limpo: fecha o pool quando o processo morrer (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('\nEncerrando…')
  await pool.end()
  process.exit(0)
})

start()

