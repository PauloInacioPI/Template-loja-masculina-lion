// =====================================================================
//  routes/admin.js — endpoints administrativos (CRUD completo)
//
//  TODO: proteger com middleware JWT quando implementar auth real
// =====================================================================

import { Router } from 'express'
import { pool } from '../db/db.js'

const router = Router()

const onlyDigits = (s) => String(s || '').replace(/\D/g, '')
const slugify = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

function httpError(status, message) {
  const e = new Error(message)
  e.statusCode = status
  return e
}

// =====================================================================
//  STATS / DASHBOARD
// =====================================================================

router.get('/stats', async (_req, res, next) => {
  try {
    const [[ordersToday]] = await pool.query(
      `SELECT COUNT(*) AS n FROM orders WHERE DATE(created_at) = CURDATE()`
    )
    const [[revenueToday]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS v FROM orders
       WHERE DATE(created_at) = CURDATE() AND status <> 'canceled'`
    )
    const [[newCustomers]] = await pool.query(
      `SELECT COUNT(*) AS n FROM customers WHERE DATE(created_at) = CURDATE()`
    )
    const [[totalCustomers]] = await pool.query(`SELECT COUNT(*) AS n FROM customers`)
    const [[stock]] = await pool.query(`SELECT COALESCE(SUM(stock), 0) AS v FROM product_variants`)
    const [[lowStock]] = await pool.query(
      `SELECT COUNT(*) AS n FROM product_variants WHERE stock > 0 AND stock <= 5`
    )
    const [[ordersTotal]] = await pool.query(`SELECT COUNT(*) AS n FROM orders`)
    const [[revenueTotal]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS v FROM orders WHERE status <> 'canceled'`
    )

    res.json({
      ordersToday:    Number(ordersToday.n),
      revenueToday:   Number(revenueToday.v),
      newCustomers:   Number(newCustomers.n),
      totalCustomers: Number(totalCustomers.n),
      stockUnits:     Number(stock.v),
      variantsLow:    Number(lowStock.n),
      ordersTotal:    Number(ordersTotal.n),
      revenueTotal:   Number(revenueTotal.v),
    })
  } catch (err) { next(err) }
})

router.get('/sales-chart', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS d, COALESCE(SUM(total), 0) AS v
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         AND status <> 'canceled'
       GROUP BY DATE(created_at)
       ORDER BY d`
    )
    // garante 7 dias mesmo sem vendas
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0, 10)
      const found = rows.find((r) => String(r.d).slice(0, 10) === key)
      days.push({
        day: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][date.getDay()],
        value: Number(found?.v || 0),
      })
    }
    res.json(days)
  } catch (err) { next(err) }
})

router.get('/top-products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT oi.product_name AS name,
              SUM(oi.quantity) AS sales,
              SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status <> 'canceled'
       GROUP BY oi.product_name
       ORDER BY sales DESC
       LIMIT 5`
    )
    res.json(rows.map((r) => ({
      name: r.name,
      sales: Number(r.sales),
      revenue: Number(r.revenue),
    })))
  } catch (err) { next(err) }
})

// =====================================================================
//  LOOKUPS (cores, tamanhos, categorias, marcas)
// =====================================================================

router.get('/colors', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, slug, name, hex FROM colors ORDER BY name`)
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/sizes', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, label, kind, sort_order FROM sizes ORDER BY kind, sort_order`)
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, slug, name FROM categories ORDER BY name`)
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/brands', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, slug, name FROM brands ORDER BY name`)
    res.json(rows)
  } catch (err) { next(err) }
})

// =====================================================================
//  PRODUCTS  (lista + CRUD + variantes)
// =====================================================================

router.get('/products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id, p.slug, p.name, p.description, p.gender,
        p.price, p.old_price AS oldPrice, p.installments,
        p.primary_image_url AS image, p.hover_image_url AS hoverImage,
        p.rating, p.reviews_count AS reviews,
        p.is_new AS isNew, p.is_active AS isActive,
        p.brand_id    AS brandId,
        p.category_id AS categoryId,
        b.name        AS brand,
        c.slug        AS categorySlug, c.name AS categoryName,
        COALESCE(SUM(pv.stock), 0) AS stock
      FROM products p
      JOIN brands b     ON b.id = p.brand_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC, p.id DESC
    `)
    res.json(rows.map((p) => ({
      ...p,
      price:    Number(p.price),
      oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
      rating:   p.rating   != null ? Number(p.rating)   : null,
      stock:    Number(p.stock),
      isNew:    Boolean(p.isNew),
      isActive: Boolean(p.isActive),
      category: { slug: p.categorySlug, name: p.categoryName },
    })))
  } catch (err) { next(err) }
})

router.get('/products/:id', async (req, res, next) => {
  try {
    const [[p]] = await pool.query(
      `SELECT p.*, b.name AS brand, c.slug AS categorySlug, c.name AS categoryName
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ? LIMIT 1`,
      [req.params.id]
    )
    if (!p) throw httpError(404, 'Produto não encontrado')
    const [variants] = await pool.query(
      `SELECT pv.id, pv.color_id AS colorId, pv.size_id AS sizeId,
              pv.sku, pv.stock, pv.is_active AS isActive,
              col.name AS colorName, col.slug AS colorSlug, col.hex AS colorHex,
              s.label AS sizeLabel, s.kind AS sizeKind
       FROM product_variants pv
       LEFT JOIN colors col ON col.id = pv.color_id
       LEFT JOIN sizes s    ON s.id  = pv.size_id
       WHERE pv.product_id = ?
       ORDER BY col.name, s.sort_order`,
      [req.params.id]
    )
    res.json({
      ...p,
      price:    Number(p.price),
      oldPrice: p.old_price != null ? Number(p.old_price) : null,
      rating:   p.rating != null ? Number(p.rating) : null,
      isNew:    Boolean(p.is_new),
      isActive: Boolean(p.is_active),
      brandId:    p.brand_id,
      categoryId: p.category_id,
      image:      p.primary_image_url,
      hoverImage: p.hover_image_url,
      reviews:    p.reviews_count,
      category:   { slug: p.categorySlug, name: p.categoryName },
      variants:   variants.map((v) => ({
        ...v,
        stock: Number(v.stock),
        isActive: Boolean(v.isActive),
      })),
    })
  } catch (err) { next(err) }
})

router.post('/products', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name é obrigatório')
    if (!b.brandId)      throw httpError(400, 'brandId é obrigatório')
    if (!b.categoryId)   throw httpError(400, 'categoryId é obrigatório')
    if (b.price == null) throw httpError(400, 'price é obrigatório')
    const slug = `${slugify(b.name)}-${Date.now().toString(36)}`
    const [r] = await pool.query(
      `INSERT INTO products
        (slug, name, description, brand_id, category_id, gender, price, old_price,
         installments, primary_image_url, hover_image_url, is_new, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, b.name.trim(), b.description ?? null,
        b.brandId, b.categoryId, b.gender || 'unissex',
        Number(b.price), b.oldPrice != null ? Number(b.oldPrice) : null,
        Number(b.installments || 1), b.image ?? null, b.hoverImage ?? null,
        b.isNew ? 1 : 0, b.isActive === false ? 0 : 1,
      ]
    )
    res.status(201).json({ id: r.insertId, slug })
  } catch (err) { next(err) }
})

router.put('/products/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    await pool.query(
      `UPDATE products SET
         name = ?, description = ?, brand_id = ?, category_id = ?, gender = ?,
         price = ?, old_price = ?, installments = ?,
         primary_image_url = ?, hover_image_url = ?,
         is_new = ?, is_active = ?
       WHERE id = ?`,
      [
        b.name, b.description ?? null, b.brandId, b.categoryId, b.gender || 'unissex',
        Number(b.price), b.oldPrice != null ? Number(b.oldPrice) : null,
        Number(b.installments || 1), b.image ?? null, b.hoverImage ?? null,
        b.isNew ? 1 : 0, b.isActive === false ? 0 : 1, req.params.id,
      ]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.patch('/products/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    const updates = []
    const values  = []
    if (typeof b.isActive === 'boolean') { updates.push('is_active = ?'); values.push(b.isActive ? 1 : 0) }
    if (typeof b.isNew    === 'boolean') { updates.push('is_new = ?');    values.push(b.isNew    ? 1 : 0) }
    if (b.price != null) { updates.push('price = ?'); values.push(Number(b.price)) }
    if (updates.length === 0) throw httpError(400, 'Nada para atualizar')
    values.push(req.params.id)
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/products/:id', async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM products WHERE id = ?`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ---- variantes ----

router.post('/products/:id/variants', async (req, res, next) => {
  try {
    const b = req.body || {}
    const productId = req.params.id
    const sku = b.sku || `P${productId}-${Date.now().toString(36).toUpperCase()}`
    const [r] = await pool.query(
      `INSERT INTO product_variants (product_id, color_id, size_id, sku, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, b.colorId || null, b.sizeId || null, sku, Number(b.stock || 0), b.isActive === false ? 0 : 1]
    )
    res.status(201).json({ id: r.insertId, sku })
  } catch (err) { next(err) }
})

router.patch('/variants/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    const updates = []
    const values  = []
    if (b.stock != null) { updates.push('stock = ?'); values.push(Number(b.stock)) }
    if (typeof b.isActive === 'boolean') { updates.push('is_active = ?'); values.push(b.isActive ? 1 : 0) }
    if (updates.length === 0) throw httpError(400, 'Nada para atualizar')
    values.push(req.params.id)
    await pool.query(`UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`, values)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/variants/:id', async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM product_variants WHERE id = ?`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  CUSTOMERS
// =====================================================================

router.get('/customers', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.email, c.phone, c.cpf, c.created_at AS createdAt,
             COUNT(o.id) AS orders,
             COALESCE(SUM(CASE WHEN o.status <> 'canceled' THEN o.total END), 0) AS total,
             MAX(DATE(o.created_at)) AS lastOrder
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)
    res.json(rows.map((r) => ({
      ...r,
      orders: Number(r.orders),
      total:  Number(r.total),
    })))
  } catch (err) { next(err) }
})

router.post('/customers', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name é obrigatório')
    if (onlyDigits(b.phone).length < 10) throw httpError(400, 'phone inválido')
    const phone = onlyDigits(b.phone)
    const [exists] = await pool.query(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [phone])
    if (exists.length) throw httpError(409, 'Já existe cliente com esse telefone')
    const [r] = await pool.query(
      `INSERT INTO customers (name, email, phone, cpf) VALUES (?, ?, ?, ?)`,
      [b.name.trim(), b.email || null, phone, b.cpf || null]
    )
    res.status(201).json({ id: r.insertId })
  } catch (err) { next(err) }
})

router.put('/customers/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name é obrigatório')
    if (onlyDigits(b.phone).length < 10) throw httpError(400, 'phone inválido')
    await pool.query(
      `UPDATE customers SET name = ?, email = ?, phone = ?, cpf = ? WHERE id = ?`,
      [b.name.trim(), b.email || null, onlyDigits(b.phone), b.cpf || null, req.params.id]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/customers/:id', async (req, res, next) => {
  try {
    // verifica se tem pedidos
    const [[orders]] = await pool.query(`SELECT COUNT(*) AS n FROM orders WHERE customer_id = ?`, [req.params.id])
    if (orders.n > 0) throw httpError(409, 'Cliente tem pedidos vinculados — não pode excluir')
    await pool.query(`DELETE FROM customers WHERE id = ?`, [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  ORDERS
// =====================================================================

const ALLOWED_STATUS = new Set(['pending', 'paid', 'shipping', 'delivered', 'canceled'])

router.get('/orders', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.code, o.status, o.payment_method AS payment,
             o.subtotal, o.shipping, o.discount, o.total,
             o.created_at AS createdAt,
             c.name AS customer,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
    `)
    res.json(rows.map((r) => ({
      ...r,
      items:    Number(r.items),
      subtotal: Number(r.subtotal),
      shipping: Number(r.shipping),
      discount: Number(r.discount),
      total:    Number(r.total),
    })))
  } catch (err) { next(err) }
})

router.get('/orders/:id', async (req, res, next) => {
  try {
    const [[o]] = await pool.query(
      `SELECT o.*, c.name AS customerName, c.phone AS customerPhone,
              c.email AS customerEmail, c.cpf AS customerCpf
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? LIMIT 1`,
      [req.params.id]
    )
    if (!o) throw httpError(404, 'Pedido não encontrado')
    const [items] = await pool.query(
      `SELECT oi.*, pv.product_id AS productId, p.primary_image_url AS image
       FROM order_items oi
       LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
       LEFT JOIN products p ON p.id = pv.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    )
    res.json({
      id: o.id,
      code: o.code,
      status: o.status,
      payment: o.payment_method,
      createdAt: o.created_at,
      customer: {
        name:  o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail,
        cpf:   o.customerCpf,
      },
      shipping: {
        cep: o.ship_cep,
        address: `${o.ship_street ?? ''}, ${o.ship_number ?? ''}${o.ship_complement ? ' - ' + o.ship_complement : ''}`.trim(),
        neighborhood: o.ship_neighborhood,
        city: `${o.ship_city ?? ''} / ${o.ship_uf ?? ''}`,
      },
      items: items.map((it) => ({
        name: it.product_name,
        color: it.color_name,
        size: it.size_label,
        qty: it.quantity,
        unitPrice: Number(it.unit_price),
        lineTotal: Number(it.line_total),
        image: it.image,
      })),
      totals: {
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        discount: Number(o.discount),
        total:    Number(o.total),
      },
      notes: o.notes,
    })
  } catch (err) { next(err) }
})

router.patch('/orders/:id', async (req, res, next) => {
  const conn = await pool.getConnection()
  try {
    const newStatus = req.body?.status
    if (!ALLOWED_STATUS.has(newStatus)) throw httpError(400, 'status inválido')

    await conn.beginTransaction()

    // Pega o status atual pra decidir o ajuste de estoque
    const [[order]] = await conn.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [req.params.id])
    if (!order) throw httpError(404, 'Pedido não encontrado')
    const oldStatus = order.status

    // Estoque inteligente:
    //   pedido sai pra "canceled"      → DEVOLVE estoque
    //   pedido VOLTA de "canceled"     → DEDUZ estoque (com guarda contra negativo)
    if (oldStatus !== 'canceled' && newStatus === 'canceled') {
      const [items] = await conn.query(
        'SELECT product_variant_id, quantity FROM order_items WHERE order_id = ? AND product_variant_id IS NOT NULL',
        [req.params.id]
      )
      for (const it of items) {
        await conn.query(
          'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
          [it.quantity, it.product_variant_id]
        )
      }
    } else if (oldStatus === 'canceled' && newStatus !== 'canceled') {
      const [items] = await conn.query(
        'SELECT product_variant_id, quantity FROM order_items WHERE order_id = ? AND product_variant_id IS NOT NULL',
        [req.params.id]
      )
      for (const it of items) {
        const [r] = await conn.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [it.quantity, it.product_variant_id, it.quantity]
        )
        if (r.affectedRows === 0) {
          throw httpError(409, 'Estoque insuficiente para reativar este pedido')
        }
      }
    }

    await conn.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, req.params.id])
    await conn.commit()
    res.json({ ok: true, oldStatus, newStatus })
  } catch (err) {
    await conn.rollback()
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message })
    next(err)
  } finally {
    conn.release()
  }
})

// =====================================================================
//  SITE SETTINGS (configurações + conteúdos editáveis da loja)
// =====================================================================

router.get('/settings', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM site_settings')
    const out = {}
    for (const r of rows) {
      out[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value
    }
    res.json(out)
  } catch (err) { next(err) }
})

router.get('/settings/:key', async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT `value` FROM site_settings WHERE `key` = ?', [req.params.key])
    if (!row) throw httpError(404, 'Configuração não encontrada')
    res.json(typeof row.value === 'string' ? JSON.parse(row.value) : row.value)
  } catch (err) { next(err) }
})

router.put('/settings/:key', async (req, res, next) => {
  try {
    const value = req.body
    if (value === undefined) throw httpError(400, 'value obrigatório')
    await pool.query(
      `INSERT INTO site_settings (\`key\`, \`value\`)
       VALUES (?, CAST(? AS JSON))
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      [req.params.key, JSON.stringify(value)]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  LOOKUPS CRUD (categories, brands, colors, sizes)
// =====================================================================

// Categories
router.post('/categories', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name obrigatório')
    const slug = b.slug?.trim() || slugify(b.name)
    const [r] = await pool.query('INSERT INTO categories (slug, name) VALUES (?, ?)', [slug, b.name.trim()])
    res.status(201).json({ id: r.insertId, slug })
  } catch (err) { next(err) }
})
router.put('/categories/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    await pool.query('UPDATE categories SET slug = ?, name = ? WHERE id = ?',
      [b.slug?.trim() || slugify(b.name), b.name.trim(), req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM products WHERE category_id = ?', [req.params.id])
    if (c.n > 0) throw httpError(409, 'Categoria tem produtos — não pode excluir')
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Brands
router.post('/brands', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name obrigatório')
    const slug = b.slug?.trim() || slugify(b.name)
    const [r] = await pool.query('INSERT INTO brands (slug, name) VALUES (?, ?)', [slug, b.name.trim()])
    res.status(201).json({ id: r.insertId, slug })
  } catch (err) { next(err) }
})
router.put('/brands/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    await pool.query('UPDATE brands SET slug = ?, name = ? WHERE id = ?',
      [b.slug?.trim() || slugify(b.name), b.name.trim(), req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})
router.delete('/brands/:id', async (req, res, next) => {
  try {
    const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM products WHERE brand_id = ?', [req.params.id])
    if (c.n > 0) throw httpError(409, 'Marca tem produtos — não pode excluir')
    await pool.query('DELETE FROM brands WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Colors
router.post('/colors', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name?.trim()) throw httpError(400, 'name obrigatório')
    if (!b.hex?.match(/^#[0-9a-f]{6}$/i)) throw httpError(400, 'hex inválido (#RRGGBB)')
    const slug = b.slug?.trim() || slugify(b.name)
    const [r] = await pool.query('INSERT INTO colors (slug, name, hex) VALUES (?, ?, ?)', [slug, b.name.trim(), b.hex])
    res.status(201).json({ id: r.insertId, slug })
  } catch (err) { next(err) }
})
router.put('/colors/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.hex?.match(/^#[0-9a-f]{6}$/i)) throw httpError(400, 'hex inválido')
    await pool.query('UPDATE colors SET slug = ?, name = ?, hex = ? WHERE id = ?',
      [b.slug?.trim() || slugify(b.name), b.name.trim(), b.hex, req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})
router.delete('/colors/:id', async (req, res, next) => {
  try {
    const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM product_variants WHERE color_id = ?', [req.params.id])
    if (c.n > 0) throw httpError(409, 'Cor está em uso — não pode excluir')
    await pool.query('DELETE FROM colors WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Sizes
router.post('/sizes', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.label?.trim()) throw httpError(400, 'label obrigatório')
    const [r] = await pool.query('INSERT INTO sizes (label, kind, sort_order) VALUES (?, ?, ?)',
      [b.label.trim(), b.kind || 'clothing', Number(b.sortOrder ?? b.sort_order ?? 0)])
    res.status(201).json({ id: r.insertId })
  } catch (err) { next(err) }
})
router.put('/sizes/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    await pool.query('UPDATE sizes SET label = ?, kind = ?, sort_order = ? WHERE id = ?',
      [b.label.trim(), b.kind || 'clothing', Number(b.sortOrder ?? b.sort_order ?? 0), req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})
router.delete('/sizes/:id', async (req, res, next) => {
  try {
    const [[c]] = await pool.query('SELECT COUNT(*) AS n FROM product_variants WHERE size_id = ?', [req.params.id])
    if (c.n > 0) throw httpError(409, 'Tamanho está em uso — não pode excluir')
    await pool.query('DELETE FROM sizes WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  COUPONS CRUD
// =====================================================================

router.get('/coupons', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC')
    res.json(rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      min_subtotal: Number(r.min_subtotal),
      is_active: Boolean(r.is_active),
    })))
  } catch (err) { next(err) }
})

router.post('/coupons', async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.code?.trim()) throw httpError(400, 'code obrigatório')
    if (!['percent', 'fixed'].includes(b.kind)) throw httpError(400, 'kind inválido')
    const [r] = await pool.query(
      `INSERT INTO coupons (code, kind, amount, min_subtotal, max_uses, valid_until, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b.code.trim().toUpperCase(), b.kind, Number(b.amount),
        Number(b.min_subtotal || 0), b.max_uses ? Number(b.max_uses) : null,
        b.valid_until || null, b.is_active !== false ? 1 : 0,
      ]
    )
    res.status(201).json({ id: r.insertId })
  } catch (err) { next(err) }
})

router.put('/coupons/:id', async (req, res, next) => {
  try {
    const b = req.body || {}
    await pool.query(
      `UPDATE coupons SET code = ?, kind = ?, amount = ?, min_subtotal = ?,
        max_uses = ?, valid_until = ?, is_active = ? WHERE id = ?`,
      [
        b.code.trim().toUpperCase(), b.kind, Number(b.amount),
        Number(b.min_subtotal || 0), b.max_uses ? Number(b.max_uses) : null,
        b.valid_until || null, b.is_active !== false ? 1 : 0, req.params.id,
      ]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/coupons/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  NEWSLETTER (subscribers — visualização admin)
// =====================================================================

router.get('/newsletter', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, created_at AS createdAt FROM newsletter_subscribers ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) { next(err) }
})

router.delete('/newsletter/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// =====================================================================
//  Error handler local — converte erros com .statusCode em JSON
// =====================================================================
router.use((err, _req, res, next) => {
  if (err.statusCode) return res.status(err.statusCode).json({ error: err.message })
  next(err)
})

export default router
