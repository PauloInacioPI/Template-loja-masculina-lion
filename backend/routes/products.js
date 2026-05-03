// =====================================================================
//  routes/products.js — Endpoints de produtos
//
//  GET /api/products → lista todos os produtos ativos com:
//                       - dados do produto
//                       - marca e categoria
//                       - cores disponíveis (com estoque > 0)
//                       - tamanhos disponíveis (com estoque > 0)
//                       - desconto calculado
//
//  Estratégia: 3 queries simples + merge em JS.
//    Por que não 1 query gigante com JOINs? Daria linhas duplicadas
//    (cada combinação cor × tamanho gera uma linha) e teríamos que
//    deduplicar manualmente. Mais lento e mais difícil de ler.
// =====================================================================

import { Router } from 'express'
import { pool } from '../db/db.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    // ---------- 1. Lista de produtos com brand + category ----------
    const [products] = await pool.query(`
      SELECT
        p.id, p.slug, p.name, p.description, p.gender,
        p.price, p.old_price AS oldPrice, p.installments,
        p.primary_image_url AS image, p.hover_image_url AS hoverImage,
        p.rating, p.reviews_count AS reviews, p.is_new AS isNew,
        b.name AS brand,
        c.slug AS categorySlug, c.name AS categoryName
      FROM products p
      JOIN brands     b ON b.id = p.brand_id
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC, p.id DESC
    `)

    if (products.length === 0) return res.json([])

    const ids = products.map(p => p.id)

    // ---------- 2. Cores disponíveis (com estoque) ----------
    // Note o "?" — mysql2 expande array automaticamente: WHERE id IN (?)  →  WHERE id IN (1,2,3,...)
    const [colorRows] = await pool.query(`
      SELECT DISTINCT pv.product_id, c.slug, c.name, c.hex
      FROM product_variants pv
      JOIN colors c ON c.id = pv.color_id
      WHERE pv.product_id IN (?) AND pv.stock > 0 AND pv.is_active = TRUE
    `, [ids])

    // ---------- 3. Tamanhos disponíveis (com estoque), em ordem ----------
    const [sizeRows] = await pool.query(`
      SELECT DISTINCT pv.product_id, s.label, s.sort_order
      FROM product_variants pv
      JOIN sizes s ON s.id = pv.size_id
      WHERE pv.product_id IN (?) AND pv.stock > 0 AND pv.is_active = TRUE
      ORDER BY s.sort_order
    `, [ids])

    // ---------- 4. Agrupa cores e tamanhos por product_id ----------
    const colorsByProduct = new Map()
    for (const r of colorRows) {
      if (!colorsByProduct.has(r.product_id)) colorsByProduct.set(r.product_id, [])
      colorsByProduct.get(r.product_id).push({ slug: r.slug, name: r.name, hex: r.hex })
    }
    const sizesByProduct = new Map()
    for (const r of sizeRows) {
      if (!sizesByProduct.has(r.product_id)) sizesByProduct.set(r.product_id, [])
      sizesByProduct.get(r.product_id).push(r.label)
    }

    // ---------- 5. Monta a resposta final ----------
    const result = products.map(p => {
      const { categorySlug, categoryName, ...rest } = p
      const price = Number(p.price)
      const oldPrice = p.oldPrice != null ? Number(p.oldPrice) : null
      return {
        ...rest,
        price,
        oldPrice,
        rating: p.rating != null ? Number(p.rating) : null,
        isNew: Boolean(p.isNew),
        category: { slug: categorySlug, name: categoryName },
        colors: colorsByProduct.get(p.id) || [],
        sizes: sizesByProduct.get(p.id) || [],
        discount: oldPrice ? Math.round((1 - price / oldPrice) * 100) : null,
      }
    })

    res.json(result)
  } catch (err) {
    next(err)   // delega pro middleware de erro do server.js
  }
})

export default router
