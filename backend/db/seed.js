// =====================================================================
//  seed.js — Popular o banco lion_modas com dados iniciais
//
//  Como executar: npm run seed
//
//  O que esse script faz:
//    1. Limpa todas as tabelas (TRUNCATE) na ordem correta
//    2. Insere lookup tables: brands, categories, colors, sizes
//    3. Insere 24 produtos
//    4. Pra cada produto, cria suas VARIANTES (cor × tamanho) com estoque
//
//  Conceito-chave: PREPARED STATEMENTS
//    Note os "?" nos INSERT abaixo — em vez de concatenar strings:
//        ❌ `INSERT ... VALUES ('${nome}')`  (vulnerável a SQL injection)
//        ✓ `INSERT ... VALUES (?)` + [nome]  (driver escapa pra você)
// =====================================================================

import 'dotenv/config'
import { pool } from './db.js'

// --- helpers ---------------------------------------------------------
const slugify = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// --- dados de seed ---------------------------------------------------

const BRANDS = ['LION', 'LION x KAOS', 'CREW', 'STREETLAB']

const CATEGORIES = [
  { slug: 'camisetas', name: 'Camisetas' },
  { slug: 'moletons',  name: 'Moletons & Hoodies' },
  { slug: 'jaquetas',  name: 'Jaquetas' },
  { slug: 'calcas',    name: 'Calças' },
  { slug: 'tenis',     name: 'Tênis' },
  { slug: 'bones',     name: 'Bonés' },
  { slug: 'mochilas',  name: 'Mochilas' },
  { slug: 'beanies',   name: 'Beanies' },
]

const COLORS = [
  { slug: 'black',  name: 'Preto',    hex: '#0a0a0a' },
  { slug: 'white',  name: 'Branco',   hex: '#f4f4f4' },
  { slug: 'gray',   name: 'Cinza',    hex: '#6b7280' },
  { slug: 'beige',  name: 'Bege',     hex: '#d6c5a8' },
  { slug: 'red',    name: 'Vermelho', hex: '#b91c1c' },
  { slug: 'green',  name: 'Verde',    hex: '#3f5c3a' },
  { slug: 'navy',   name: 'Azul',     hex: '#1e2a44' },
  { slug: 'brown',  name: 'Marrom',   hex: '#5b3a29' },
]

const SIZES = [
  // roupa
  { label: 'PP',  kind: 'clothing', sort_order: 1 },
  { label: 'P',   kind: 'clothing', sort_order: 2 },
  { label: 'M',   kind: 'clothing', sort_order: 3 },
  { label: 'G',   kind: 'clothing', sort_order: 4 },
  { label: 'GG',  kind: 'clothing', sort_order: 5 },
  { label: 'XGG', kind: 'clothing', sort_order: 6 },
  // calçado
  { label: '38', kind: 'shoe', sort_order: 1 },
  { label: '39', kind: 'shoe', sort_order: 2 },
  { label: '40', kind: 'shoe', sort_order: 3 },
  { label: '41', kind: 'shoe', sort_order: 4 },
  { label: '42', kind: 'shoe', sort_order: 5 },
  { label: '43', kind: 'shoe', sort_order: 6 },
  { label: '44', kind: 'shoe', sort_order: 7 },
  // acessórios
  { label: 'ÚNICO', kind: 'unique', sort_order: 1 },
]

const CLOTHING_FULL = ['PP','P','M','G','GG','XGG']
const CLOTHING_PEQUENO = ['PP','P','M','G']
const SHOE_FULL = ['38','39','40','41','42','43','44']

const PRODUCTS = [
  { id:'p001', name:'Camiseta Box Logo',       category:'camisetas', gender:'masculino', brand:'LION',         price:149.90, installments:10, isNew:true,  rating:4.7, reviews:132, colors:['black','white','beige'],            sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80&auto=format&fit=crop' },
  { id:'p002', name:'Hoodie Heavy Black',      category:'moletons',  gender:'unissex',   brand:'LION',         price:349.90, installments:10, isNew:true,  rating:4.9, reviews:287, colors:['black','gray'],                      sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80&auto=format&fit=crop' },
  { id:'p003', name:'Calça Cargo Wide',        category:'calcas',    gender:'masculino', brand:'STREETLAB',    price:289.90, installments:10, isNew:true,  rating:4.6, reviews:89,  colors:['black','beige','green'],             sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1473966968600-fa801b3a87d4?w=700&q=80&auto=format&fit=crop' },
  { id:'p004', name:'Boné Trucker Urban',      category:'bones',     gender:'unissex',   brand:'LION',         price:99.90,  installments:4,  isNew:true,  rating:4.8, reviews:211, colors:['black','white','red','navy'],         sizes:['ÚNICO'],     image:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=700&q=80&auto=format&fit=crop' },
  { id:'p005', name:'Jaqueta Corta-Vento',     category:'jaquetas',  gender:'masculino', brand:'LION',         price:459.90, installments:10,                rating:4.8, reviews:124, colors:['black','navy'],                      sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80&auto=format&fit=crop' },
  { id:'p006', name:'Moletom Crewneck',        category:'moletons',  gender:'unissex',   brand:'CREW',         price:259.90, installments:10,                rating:4.9, reviews:287, colors:['black','gray','beige'],              sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=80&auto=format&fit=crop' },
  { id:'p007', name:'Tênis Urban Runner',      category:'tenis',     gender:'unissex',   brand:'LION x KAOS',  price:549.90, installments:10,                rating:4.7, reviews:92,  colors:['black','white'],                     sizes:SHOE_FULL,     image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=80&auto=format&fit=crop' },
  { id:'p008', name:'Camiseta Oversized',      category:'camisetas', gender:'unissex',   brand:'LION',         price:129.90, installments:6,                 rating:4.9, reviews:312, colors:['black','white','beige','green'],     sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80&auto=format&fit=crop' },
  { id:'p009', name:'Calça Jogger',            category:'calcas',    gender:'masculino', brand:'CREW',         price:159.90, oldPrice:229.90, installments:6, isSale:true, rating:4.5, reviews:78,  colors:['black','gray'],          sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1473966968600-fa801b3a87d4?w=700&q=80&auto=format&fit=crop' },
  { id:'p010', name:'Camiseta Estampada',      category:'camisetas', gender:'unissex',   brand:'LION x KAOS',  price:79.90,  oldPrice:119.90, installments:4, isSale:true, rating:4.6, reviews:154, colors:['black','white'],          sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&q=80&auto=format&fit=crop' },
  { id:'p011', name:'Mochila Tática',          category:'mochilas',  gender:'unissex',   brand:'STREETLAB',    price:199.90, oldPrice:299.90, installments:6, isSale:true, rating:4.7, reviews:203, colors:['black','green'],          sizes:['ÚNICO'],     image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=700&q=80&auto=format&fit=crop' },
  { id:'p012', name:'Beanie Wool',             category:'beanies',   gender:'unissex',   brand:'LION',         price:49.90,  oldPrice:79.90,  installments:2, isSale:true, rating:4.4, reviews:65,  colors:['black','gray','brown','beige'], sizes:['ÚNICO'], image:'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=700&q=80&auto=format&fit=crop' },
  { id:'p013', name:'Camiseta Long Fit',       category:'camisetas', gender:'masculino', brand:'LION',         price:119.90, installments:6,                 rating:4.6, reviews:47,  colors:['black','white'],                     sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80&auto=format&fit=crop' },
  { id:'p014', name:'Cropped Feminino',        category:'camisetas', gender:'feminino',  brand:'LION',         price:89.90,  installments:4,  isNew:true,    rating:4.8, reviews:96,  colors:['black','white','beige'],            sizes:CLOTHING_PEQUENO, image:'https://images.unsplash.com/photo-1564257577-67d57f7d4c5d?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1529903384028-929ae5dccdf1?w=700&q=80&auto=format&fit=crop' },
  { id:'p015', name:'Calça Wide Leg',          category:'calcas',    gender:'feminino',  brand:'CREW',         price:249.90, installments:10, isNew:true,    rating:4.7, reviews:52,  colors:['black','beige'],                     sizes:CLOTHING_PEQUENO, image:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1473966968600-fa801b3a87d4?w=700&q=80&auto=format&fit=crop' },
  { id:'p016', name:'Jaqueta Bomber',          category:'jaquetas',  gender:'unissex',   brand:'LION x KAOS',  price:549.90, installments:10,                rating:4.9, reviews:168, colors:['black','green'],                     sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80&auto=format&fit=crop' },
  { id:'p017', name:'Tênis Skate Classic',     category:'tenis',     gender:'unissex',   brand:'STREETLAB',    price:389.90, oldPrice:499.90, installments:10, isSale:true, rating:4.6, reviews:211, colors:['black','white'],         sizes:SHOE_FULL,     image:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80&auto=format&fit=crop' },
  { id:'p018', name:'Boné Snapback',           category:'bones',     gender:'unissex',   brand:'CREW',         price:79.90,  installments:3,                 rating:4.5, reviews:88,  colors:['black','white','red'],               sizes:['ÚNICO'],     image:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&q=80&auto=format&fit=crop' },
  { id:'p019', name:'Moletom Zip Hoodie',      category:'moletons',  gender:'unissex',   brand:'LION',         price:329.90, installments:10,                rating:4.8, reviews:145, colors:['black','gray','navy'],               sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80&auto=format&fit=crop' },
  { id:'p020', name:'Camiseta Polo Slim',      category:'camisetas', gender:'masculino', brand:'CREW',         price:169.90, installments:6,                 rating:4.4, reviews:38,  colors:['black','white','navy'],              sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80&auto=format&fit=crop' },
  { id:'p021', name:'Vestido Midi Casual',     category:'camisetas', gender:'feminino',  brand:'LION',         price:219.90, installments:10, isNew:true,    rating:4.7, reviews:71,  colors:['black','beige'],                     sizes:CLOTHING_PEQUENO, image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1529903384028-929ae5dccdf1?w=700&q=80&auto=format&fit=crop' },
  { id:'p022', name:'Jaqueta Jeans',           category:'jaquetas',  gender:'unissex',   brand:'STREETLAB',    price:379.90, oldPrice:489.90, installments:10, isSale:true, rating:4.5, reviews:102, colors:['navy'],                  sizes:CLOTHING_FULL, image:'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80&auto=format&fit=crop' },
  { id:'p023', name:'Mochila Streetpack',      category:'mochilas',  gender:'unissex',   brand:'LION',         price:259.90, installments:10,                rating:4.7, reviews:156, colors:['black'],                             sizes:['ÚNICO'],     image:'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80&auto=format&fit=crop' },
  { id:'p024', name:'Tênis Chunky Sneaker',    category:'tenis',     gender:'unissex',   brand:'LION x KAOS',  price:619.90, installments:10, isNew:true,    rating:4.8, reviews:89,  colors:['white','black'],                     sizes:SHOE_FULL,     image:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=80&auto=format&fit=crop', hoverImage:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&q=80&auto=format&fit=crop' },
]

const DESCRIPTIONS = {
  camisetas: 'Modelagem oversized, gola redonda reforçada e estampa em silk de alta durabilidade. Tecido 100% algodão fio 30.1.',
  moletons:  'Moletom flanelado peluciado, gramatura 380g/m². Bolso canguru, punhos e barra ribana.',
  jaquetas:  'Acabamento premium, forro interno e zíper de alta resistência.',
  calcas:    'Modelagem moderna com caimento estruturado. Tecido encorpado e bolsos funcionais.',
  tenis:     'Solado em borracha vulcanizada com amortecimento, cabedal premium e palmilha anatômica.',
  bones:     'Boné estruturado com fechamento ajustável e bordado em alta definição.',
  mochilas:  'Mochila com compartimento principal espaçoso, bolsos organizadores e alça acolchoada.',
  beanies:   'Touca em malha canelada com toque macio. Modelagem unissex.',
}

// --- execução --------------------------------------------------------

async function seed() {
  console.log('🌱 Iniciando seed do banco lion_modas\n')

  // 1. Limpar tudo (FOREIGN_KEY_CHECKS=0 ignora as FKs durante o TRUNCATE)
  await pool.query('SET FOREIGN_KEY_CHECKS=0')
  for (const t of [
    'order_items','orders','addresses','customers',
    'product_variants','product_images','products',
    'colors','sizes','categories','brands','admin_users','coupons'
  ]) {
    await pool.query(`TRUNCATE TABLE ${t}`)
  }
  await pool.query('SET FOREIGN_KEY_CHECKS=1')
  console.log('✓ Tabelas limpas')

  // 2. Brands
  const brandIds = {}
  for (const name of BRANDS) {
    const [r] = await pool.query('INSERT INTO brands (slug, name) VALUES (?, ?)', [slugify(name), name])
    brandIds[name] = r.insertId
  }
  console.log(`✓ ${BRANDS.length} marcas`)

  // 3. Categories
  const categoryIds = {}
  for (const c of CATEGORIES) {
    const [r] = await pool.query('INSERT INTO categories (slug, name) VALUES (?, ?)', [c.slug, c.name])
    categoryIds[c.slug] = r.insertId
  }
  console.log(`✓ ${CATEGORIES.length} categorias`)

  // 4. Colors
  const colorIds = {}
  for (const c of COLORS) {
    const [r] = await pool.query('INSERT INTO colors (slug, name, hex) VALUES (?, ?, ?)', [c.slug, c.name, c.hex])
    colorIds[c.slug] = r.insertId
  }
  console.log(`✓ ${COLORS.length} cores`)

  // 5. Sizes (chave: "label_kind" pra desambiguar 38 calçado vs 38 outro)
  const sizeIds = {}
  for (const s of SIZES) {
    const [r] = await pool.query(
      'INSERT INTO sizes (label, kind, sort_order) VALUES (?, ?, ?)',
      [s.label, s.kind, s.sort_order]
    )
    sizeIds[`${s.label}_${s.kind}`] = r.insertId
  }
  console.log(`✓ ${SIZES.length} tamanhos`)

  // 6. Products + variants
  let totalVariants = 0
  let totalStock = 0
  for (const p of PRODUCTS) {
    const slug = `${slugify(p.name)}-${p.id}`
    const description = DESCRIPTIONS[p.category] || null
    const [r] = await pool.query(
      `INSERT INTO products
        (slug, name, description, brand_id, category_id, gender,
         price, old_price, installments, primary_image_url, hover_image_url,
         rating, reviews_count, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, p.name, description,
        brandIds[p.brand], categoryIds[p.category], p.gender,
        p.price, p.oldPrice ?? null, p.installments ?? 1,
        p.image ?? null, p.hoverImage ?? null,
        p.rating ?? null, p.reviews ?? 0, p.isNew ?? false
      ]
    )
    const productId = r.insertId

    // Define qual "kind" de tamanho esse produto usa
    const sizeKind = p.category === 'tenis' ? 'shoe'
      : (p.sizes.length === 1 && p.sizes[0] === 'ÚNICO') ? 'unique'
      : 'clothing'

    // Cria variantes (cor × tamanho)
    for (const colorSlug of p.colors) {
      for (const sizeLabel of p.sizes) {
        const sku = `${p.id}-${colorSlug}-${sizeLabel}`.replace(/\s+/g, '').toUpperCase()
        const stock = rand(0, 25)
        await pool.query(
          `INSERT INTO product_variants (product_id, color_id, size_id, sku, stock)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, colorIds[colorSlug], sizeIds[`${sizeLabel}_${sizeKind}`], sku, stock]
        )
        totalVariants++
        totalStock += stock
      }
    }
  }
  console.log(`✓ ${PRODUCTS.length} produtos · ${totalVariants} variantes · ${totalStock} unidades em estoque`)

  // 7. Admin de exemplo (senha placeholder — depois trocaremos por bcrypt real)
  await pool.query(
    `INSERT INTO admin_users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    ['Admin', 'admin@lionmodas.com.br', '$2b$10$placeholderhash', 'super']
  )
  console.log('✓ 1 admin de exemplo')

  console.log('\n🎉 Seed concluído.')
  await pool.end()
}

seed().catch((err) => {
  console.error('\n❌ Falha no seed:', err)
  process.exit(1)
})
