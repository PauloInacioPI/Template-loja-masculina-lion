// =====================================================================
//  api.js — camada que fala com o backend Lion Modas
//
//  Centraliza as chamadas HTTP em UM arquivo. Vantagens:
//  - URL base fica em variável de ambiente (.env)
//  - Trocar o backend (ou colocar uma proxy/CDN) muda 1 lugar só
//  - Tratamento de erro e parse JSON consistente
//  - O ADAPTER converte o formato do backend pro formato que os
//    componentes do front já esperam (sem precisar reescrever cada um)
// =====================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Wrapper genérico de fetch — joga erro se status não for 2xx.
 */
async function http(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} em ${path}: ${text}`)
  }
  return res.json()
}

/**
 * Adapta UM produto vindo do backend para o formato que o front usa.
 *
 * Backend envia:
 *   colors: [{ slug, name, hex }]
 *   category: { slug, name }
 *   isNew: true/false, oldPrice: number|null
 *
 * Front (componentes legados do mock) usa:
 *   colors: ['black', 'white']        (array de slugs)
 *   swatches: ['#0a0a0a', '#f4f4f4']  (array de hex)
 *   type: 'tenis'                     (slug da categoria)
 *   badge: 'NOVO' | null
 *   isSale: bool (derivado de oldPrice)
 *
 * Manter os 2 formatos é mais barato que trocar TODOS os componentes.
 */
function adaptProduct(p) {
  const colorSlugs = (p.colors || []).map((c) => c.slug)
  const swatches   = (p.colors || []).map((c) => c.hex)
  return {
    ...p,
    image:      imageUrl(p.image),
    hoverImage: imageUrl(p.hoverImage),
    type: p.category?.slug ?? p.type,
    colors: colorSlugs,
    swatches,
    badge: p.isNew ? 'NOVO' : null,
    isSale: !!p.oldPrice,
  }
}

// ---------------------------------------------------------------------
//  Endpoints
// ---------------------------------------------------------------------

export async function fetchProducts() {
  const data = await http('/api/products')
  return data.map(adaptProduct)
}

/**
 * Cria um pedido no backend.
 * Recebe o payload já estruturado pelo CheckoutModal.
 * Retorna { id, code, total, ... } se sucesso.
 * Lança Error com a mensagem do backend se falhar.
 */
export async function createOrder(payload) {
  return http('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// =====================================================================
//  Endpoints administrativos
// =====================================================================

// Produtos
export const fetchAdminProducts        = ()        => http('/api/admin/products')
export const fetchAdminProduct         = (id)      => http(`/api/admin/products/${id}`)
export const createAdminProduct        = (body)    => http('/api/admin/products',     { method: 'POST',   body: JSON.stringify(body) })
export const updateAdminProduct        = (id, b)   => http(`/api/admin/products/${id}`, { method: 'PUT',  body: JSON.stringify(b) })
export const patchAdminProduct         = (id, b)   => http(`/api/admin/products/${id}`, { method: 'PATCH',body: JSON.stringify(b) })
export const deleteAdminProduct        = (id)      => http(`/api/admin/products/${id}`, { method: 'DELETE' })

// Variantes
export const createAdminVariant        = (pid, b)  => http(`/api/admin/products/${pid}/variants`, { method: 'POST',  body: JSON.stringify(b) })
export const patchAdminVariant         = (id, b)   => http(`/api/admin/variants/${id}`,            { method: 'PATCH', body: JSON.stringify(b) })
export const deleteAdminVariant        = (id)      => http(`/api/admin/variants/${id}`,            { method: 'DELETE' })

// Clientes
export const fetchAdminCustomers       = ()        => http('/api/admin/customers')
export const createAdminCustomer       = (b)       => http('/api/admin/customers',     { method: 'POST', body: JSON.stringify(b) })
export const updateAdminCustomer       = (id, b)   => http(`/api/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(b) })
export const deleteAdminCustomer       = (id)      => http(`/api/admin/customers/${id}`, { method: 'DELETE' })

// Pedidos
export const fetchAdminOrders          = ()        => http('/api/admin/orders')
export const fetchAdminOrder           = (id)      => http(`/api/admin/orders/${id}`)
export const patchAdminOrderStatus     = (id, st)  => http(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: st }) })

// Stats
export const fetchAdminStats           = ()        => http('/api/admin/stats')
export const fetchAdminSalesChart      = ()        => http('/api/admin/sales-chart')
export const fetchAdminTopProducts     = ()        => http('/api/admin/top-products')

// Lookups (read)
export const fetchAdminColors          = ()        => http('/api/admin/colors')
export const fetchAdminSizes           = ()        => http('/api/admin/sizes')
export const fetchAdminCategories      = ()        => http('/api/admin/categories')
export const fetchAdminBrands          = ()        => http('/api/admin/brands')

// Lookups CRUD
export const createAdminCategory  = (b)     => http('/api/admin/categories',     { method: 'POST', body: JSON.stringify(b) })
export const updateAdminCategory  = (id, b) => http(`/api/admin/categories/${id}`, { method: 'PUT',  body: JSON.stringify(b) })
export const deleteAdminCategory  = (id)    => http(`/api/admin/categories/${id}`, { method: 'DELETE' })
export const createAdminBrand     = (b)     => http('/api/admin/brands',         { method: 'POST', body: JSON.stringify(b) })
export const updateAdminBrand     = (id, b) => http(`/api/admin/brands/${id}`,     { method: 'PUT',  body: JSON.stringify(b) })
export const deleteAdminBrand     = (id)    => http(`/api/admin/brands/${id}`,     { method: 'DELETE' })
export const createAdminColor     = (b)     => http('/api/admin/colors',         { method: 'POST', body: JSON.stringify(b) })
export const updateAdminColor     = (id, b) => http(`/api/admin/colors/${id}`,     { method: 'PUT',  body: JSON.stringify(b) })
export const deleteAdminColor     = (id)    => http(`/api/admin/colors/${id}`,     { method: 'DELETE' })
export const createAdminSize      = (b)     => http('/api/admin/sizes',          { method: 'POST', body: JSON.stringify(b) })
export const updateAdminSize      = (id, b) => http(`/api/admin/sizes/${id}`,      { method: 'PUT',  body: JSON.stringify(b) })
export const deleteAdminSize      = (id)    => http(`/api/admin/sizes/${id}`,      { method: 'DELETE' })

// Site settings (admin)
export const fetchAdminSettings   = ()        => http('/api/admin/settings')
export const updateAdminSetting   = (key, v)  => http(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify(v) })

// Cupons
export const fetchAdminCoupons    = ()        => http('/api/admin/coupons')
export const createAdminCoupon    = (b)       => http('/api/admin/coupons',     { method: 'POST', body: JSON.stringify(b) })
export const updateAdminCoupon    = (id, b)   => http(`/api/admin/coupons/${id}`, { method: 'PUT',  body: JSON.stringify(b) })
export const deleteAdminCoupon    = (id)      => http(`/api/admin/coupons/${id}`, { method: 'DELETE' })

// Newsletter (admin)
export const fetchAdminNewsletter   = ()      => http('/api/admin/newsletter')
export const deleteAdminNewsletter  = (id)    => http(`/api/admin/newsletter/${id}`, { method: 'DELETE' })

// Site config público + newsletter público
export const fetchSiteConfig      = ()        => http('/api/site-config')
export const subscribeNewsletter  = (email)   => http('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })

/**
 * Upload de imagem (multipart/form-data).
 * Retorna { url, fileName, size }. A URL vem como "/uploads/abc.jpg" — o
 * helper `imageUrl(url)` abaixo prefixa o host quando precisa.
 */
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_URL}/api/admin/upload`, { method: 'POST', body: fd })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Converte URL relativa do backend ("/uploads/...") em URL absoluta para
 * exibir no front. Apenas arquivos servidos pelo backend (/uploads/) são
 * prefixados — outros paths absolutos (/lion-logo-white.png etc.) são do
 * /public do Vite e devem passar direto.
 */
export function imageUrl(url) {
  if (!url) return ''
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`
  return url
}

export { API_URL }
