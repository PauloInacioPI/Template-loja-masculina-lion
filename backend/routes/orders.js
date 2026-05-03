// =====================================================================
//  routes/orders.js — Persistência de pedidos
//
//  POST /api/orders
//    Recebe o pedido do checkout, calcula totais NO SERVIDOR (nunca
//    confia em valores enviados pelo cliente), trava estoque, salva
//    cliente/endereço/pedido/itens em uma TRANSAÇÃO atômica.
//
//  Por que TRANSAÇÃO?
//    Sem ela, se uma das queries falhar no meio (ex: estoque negativo),
//    sobram dados parciais no banco — pedido sem itens, customer órfão.
//    Com transaction: ou TUDO é gravado, ou NADA é. Garantia total.
//
//  Regra de segurança importante: NUNCA usar o subtotal/total que o
//  front envia. Ele pode ter sido adulterado no DevTools. O servidor
//  RECALCULA tudo a partir do preço REAL no banco.
// =====================================================================

import { Router } from 'express'
import { pool } from '../db/db.js'

const router = Router()

const ALLOWED_PAYMENTS = new Set(['pix', 'credit', 'boleto'])

// Lê settings (frete grátis, frete fixo, % PIX). Cai pra defaults se não tiver.
async function getShippingSettings() {
  const [[row]] = await pool.query("SELECT `value` FROM site_settings WHERE `key` = 'general'")
  const s = row ? (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) : {}
  return {
    freeShippingAt: Number(s.freeShippingAt ?? 299),
    flatShipping:   Number(s.flatShipping   ?? 19.90),
    pixDiscount:    Number(s.pixDiscountPercent ?? 10) / 100,
  }
}

// ---------- helpers ----------
const onlyDigits = (s) => String(s || '').replace(/\D/g, '')
const round2 = (n) => Math.round(n * 100) / 100

/**
 * Gera código humano único: LION-YYYY-NNNN
 * (NNNN = quantidade de pedidos do ano + 1, com padding)
 */
async function generateOrderCode(conn) {
  const year = new Date().getFullYear()
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS n FROM orders WHERE YEAR(created_at) = ?`,
    [year]
  )
  const next = String(row.n + 1).padStart(4, '0')
  return `LION-${year}-${next}`
}

// ---------------------------------------------------------------------
//  POST /api/orders
// ---------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  const body = req.body || {}

  // -------- 1. Validação simples do payload --------
  const errors = []
  const c = body.customer || {}
  const a = body.address  || {}
  const items = Array.isArray(body.items) ? body.items : []
  const payment = String(body.payment_method || '').toLowerCase()

  if (!c.name?.trim())          errors.push('customer.name é obrigatório')
  if (onlyDigits(c.phone).length < 10) errors.push('customer.phone inválido')
  if (!a.cep || onlyDigits(a.cep).length !== 8) errors.push('address.cep inválido')
  if (!a.street?.trim())        errors.push('address.street é obrigatório')
  if (!a.number?.trim())        errors.push('address.number é obrigatório')
  if (!a.neighborhood?.trim())  errors.push('address.neighborhood é obrigatório')
  if (!a.city?.trim())          errors.push('address.city é obrigatório')
  if (!a.uf || a.uf.length !== 2) errors.push('address.uf inválido')
  if (!ALLOWED_PAYMENTS.has(payment)) errors.push('payment_method inválido')
  if (items.length === 0)       errors.push('items vazio')
  for (const [i, it] of items.entries()) {
    if (!it.productId)        errors.push(`items[${i}].productId obrigatório`)
    if (!Number.isInteger(it.quantity) || it.quantity < 1) errors.push(`items[${i}].quantity inválido`)
  }
  if (errors.length) return res.status(400).json({ error: 'Validação falhou', details: errors })

  // -------- 2. Transaction --------
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // -------- 3. Resolver as variantes (cor+tamanho) e validar estoque --------
    // Em UMA query: pega variant_id, price e stock pra cada item solicitado
    const variantLookups = []
    for (const it of items) {
      const [rows] = await conn.query(
        `SELECT pv.id AS variant_id, pv.stock,
                COALESCE(pv.price_override, p.price) AS price,
                p.name AS product_name,
                col.name AS color_name, col.slug AS color_slug,
                s.label AS size_label
         FROM products p
         JOIN product_variants pv ON pv.product_id = p.id
         LEFT JOIN colors col ON col.id = pv.color_id
         LEFT JOIN sizes s    ON s.id  = pv.size_id
         WHERE p.id = ?
           AND (col.slug = ? OR (? IS NULL AND pv.color_id IS NULL))
           AND (s.label  = ? OR (? IS NULL AND pv.size_id  IS NULL))
           AND p.is_active = TRUE
           AND pv.is_active = TRUE
         LIMIT 1`,
        [it.productId, it.color || null, it.color || null, it.size || null, it.size || null]
      )
      if (rows.length === 0) {
        throw httpError(404, `Variante não encontrada: produto ${it.productId} cor=${it.color} tamanho=${it.size}`)
      }
      const v = rows[0]
      if (v.stock < it.quantity) {
        throw httpError(409, `Estoque insuficiente para "${v.product_name}" (${v.color_name}/${v.size_label}). Disponível: ${v.stock}`)
      }
      variantLookups.push({ ...v, requested: it })
    }

    // -------- 4. Cálculo de totais (servidor é a fonte da verdade) --------
    const cfg = await getShippingSettings()
    const subtotal = round2(
      variantLookups.reduce((sum, v) => sum + Number(v.price) * v.requested.quantity, 0)
    )
    const shipping = subtotal >= cfg.freeShippingAt ? 0 : cfg.flatShipping
    const discount = payment === 'pix' ? round2(subtotal * cfg.pixDiscount) : 0
    const total    = round2(subtotal + shipping - discount)

    // -------- 5. Upsert customer (por telefone) --------
    const phoneDigits = onlyDigits(c.phone)
    const [existing] = await conn.query(
      `SELECT id FROM customers WHERE phone = ? LIMIT 1`,
      [phoneDigits]
    )
    let customerId
    if (existing.length) {
      customerId = existing[0].id
      await conn.query(
        `UPDATE customers SET name = ?, email = ?, cpf = ? WHERE id = ?`,
        [c.name.trim(), c.email || null, c.cpf || null, customerId]
      )
    } else {
      const [r] = await conn.query(
        `INSERT INTO customers (name, email, phone, cpf) VALUES (?, ?, ?, ?)`,
        [c.name.trim(), c.email || null, phoneDigits, c.cpf || null]
      )
      customerId = r.insertId
    }

    // -------- 6. Insert address --------
    const [addrRes] = await conn.query(
      `INSERT INTO addresses (customer_id, cep, street, number, complement, neighborhood, city, uf)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        onlyDigits(a.cep),
        a.street.trim(),
        a.number.trim(),
        a.complement?.trim() || null,
        a.neighborhood.trim(),
        a.city.trim(),
        a.uf.toUpperCase().slice(0, 2)
      ]
    )
    const addressId = addrRes.insertId

    // -------- 7. Insert order com snapshot do endereço --------
    const code = await generateOrderCode(conn)
    const [orderRes] = await conn.query(
      `INSERT INTO orders
        (code, customer_id, address_id, status, payment_method,
         subtotal, shipping, discount, total,
         ship_cep, ship_street, ship_number, ship_complement,
         ship_neighborhood, ship_city, ship_uf,
         notes)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, customerId, addressId, payment,
        subtotal, shipping, discount, total,
        onlyDigits(a.cep), a.street.trim(), a.number.trim(), a.complement?.trim() || null,
        a.neighborhood.trim(), a.city.trim(), a.uf.toUpperCase().slice(0, 2),
        body.notes?.trim() || null
      ]
    )
    const orderId = orderRes.insertId

    // -------- 8. Insert order_items + decrementa estoque --------
    for (const v of variantLookups) {
      const lineTotal = round2(Number(v.price) * v.requested.quantity)
      await conn.query(
        `INSERT INTO order_items
          (order_id, product_variant_id, product_name, color_name, size_label,
           unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, v.variant_id, v.product_name, v.color_name, v.size_label,
         v.price, v.requested.quantity, lineTotal]
      )

      // Decrementa o estoque (com WHERE pra evitar race condition)
      const [upd] = await conn.query(
        `UPDATE product_variants
            SET stock = stock - ?
          WHERE id = ? AND stock >= ?`,
        [v.requested.quantity, v.variant_id, v.requested.quantity]
      )
      if (upd.affectedRows === 0) {
        throw httpError(409, `Estoque insuficiente (concorrência) para variante ${v.variant_id}`)
      }
    }

    // -------- 9. Marcar quando foi enviado pro WhatsApp (se vier flag) --------
    if (body.whatsapp_sent) {
      await conn.query(
        `UPDATE orders SET whatsapp_sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [orderId]
      )
    }

    // -------- 10. Commit --------
    await conn.commit()

    res.status(201).json({
      id: orderId,
      code,
      status: 'pending',
      payment_method: payment,
      subtotal, shipping, discount, total,
      items: variantLookups.length,
      customer_id: customerId,
    })
  } catch (err) {
    await conn.rollback()
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    next(err)
  } finally {
    conn.release()  // sempre devolve a conexão pro pool
  }
})

function httpError(statusCode, message) {
  const e = new Error(message)
  e.statusCode = statusCode
  return e
}

export default router
