// =====================================================================
//  /admin/produtos — CRUD real + gerenciar variantes (cor + tamanho)
// =====================================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, Filter, Edit2, Trash2, X, Image as ImageIcon, Loader2, AlertTriangle, Box } from 'lucide-react'
import { useAdminProducts } from '../../hooks/useAdminProducts'
import { useAdminLookups } from '../../hooks/useAdminLookups'
import {
  fetchAdminProduct, createAdminProduct, updateAdminProduct, patchAdminProduct, deleteAdminProduct,
  createAdminVariant, patchAdminVariant, deleteAdminVariant,
  imageUrl,
} from '../../lib/api'
import ImageUploader from '../../components/admin/ImageUploader'

const formatBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AdminProducts() {
  const { products, loading, error, refetch } = useAdminProducts()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    if (!query) return products
    const q = query.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  }, [query, products])

  const toggleActive = async (p) => {
    try {
      await patchAdminProduct(p.id, { isActive: !p.isActive })
      refetch()
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Excluir ${p.name}?`)) return
    try {
      await deleteAdminProduct(p.id)
      refetch()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Produtos</h1>
          <p className="text-sm text-urban-muted mt-1">
            {products.length} produtos · {products.filter((p) => p.isActive).length} ativos.
          </p>
        </div>
        <button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 px-4 h-10 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest">
          <Plus size={15} /> NOVO PRODUTO
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou marca…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-3 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-3 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white">
          <Filter size={14} /> FILTROS
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} />
        ) : filtered.length === 0 ? (
          <Empty />
        ) : filtered.map((p) => (
          <div key={p.id} className="bg-urban-card/50 border border-urban-border rounded-lg p-3">
            <div className="flex gap-3">
              <div className="w-16 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-urban-bg">
                {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium uppercase tracking-wide line-clamp-2 text-sm">{p.name}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {p.isNew && <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">NOVO</span>}
                  <span className="text-[11px] text-urban-muted">{p.category?.name ?? p.category}</span>
                  <span className="text-[11px] text-urban-muted">· {p.brand}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-semibold">{formatBRL(p.price)}</span>
                  {p.oldPrice && <span className="text-[11px] text-urban-muted line-through">{formatBRL(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-urban-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-urban-muted">ESTOQUE</span>
                <StockBadge stock={p.stock} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={p.isActive} onChange={() => toggleActive(p)} />
                <button onClick={() => setEditing(p)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-white hover:bg-white/5"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(p)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-urban-red hover:bg-urban-red/10"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-urban-card/50 border border-urban-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-urban-border bg-urban-bg/30">
            <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
              <th className="text-left px-5 py-3">PRODUTO</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">CATEGORIA</th>
              <th className="text-left px-5 py-3 hidden lg:table-cell">MARCA</th>
              <th className="text-left px-5 py-3">PREÇO</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">ESTOQUE</th>
              <th className="text-left px-5 py-3">ATIVO</th>
              <th className="px-5 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-urban-border/50">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-urban-muted">Nenhum produto.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-urban-bg">
                      {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium uppercase tracking-wide line-clamp-1">{p.name}</div>
                      {p.isNew && <span className="inline-block mt-0.5 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">NOVO</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell text-urban-muted">{p.category?.name ?? p.category}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-urban-muted">{p.brand}</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="font-semibold">{formatBRL(p.price)}</div>
                  {p.oldPrice && <div className="text-[11px] text-urban-muted line-through">{formatBRL(p.oldPrice)}</div>}
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell"><StockBadge stock={p.stock} /></td>
                <td className="px-5 py-3.5"><Switch checked={p.isActive} onChange={() => toggleActive(p)} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(p)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-white hover:bg-white/5"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-urban-red hover:bg-urban-red/10"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch() }}
        />
      )}
    </div>
  )
}

// =====================================================================
//  Modal de criar/editar produto + abas (Detalhes | Variantes)
// =====================================================================
function ProductFormModal({ product, onClose, onSaved }) {
  const lookups = useAdminLookups()
  const [tab, setTab] = useState('details')
  const [productId, setProductId] = useState(product?.id ?? null)
  const isNew = !productId

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl sm:mx-4 max-h-[100vh] sm:max-h-[90vh] bg-urban-bg sm:rounded-lg border border-urban-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-urban-border">
          <h2 className="text-sm font-bold tracking-widest">{isNew ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}</h2>
          <button onClick={onClose} className="text-urban-muted hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-urban-border px-5">
          <TabBtn active={tab === 'details'} onClick={() => setTab('details')}>Detalhes</TabBtn>
          <TabBtn active={tab === 'variants'} onClick={() => setTab('variants')} disabled={isNew}>
            Variantes
            {isNew && <span className="text-[10px] text-urban-muted ml-1">(salve antes)</span>}
          </TabBtn>
        </div>

        {tab === 'details' ? (
          <DetailsTab
            product={product}
            lookups={lookups}
            onSaved={(savedId) => {
              if (isNew) {
                setProductId(savedId)
                setTab('variants')
              } else {
                onSaved()
              }
            }}
            onClose={onClose}
            isNew={isNew}
          />
        ) : (
          <VariantsTab productId={productId} lookups={lookups} onClose={onSaved} />
        )}
      </div>
    </div>
  )
}

function TabBtn({ active, children, ...rest }) {
  return (
    <button {...rest} className={`px-4 h-12 text-xs font-semibold tracking-widest border-b-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'border-urban-red text-white' : 'border-transparent text-urban-muted hover:text-white'}`}>{children}</button>
  )
}

// ---------- Tab DETALHES ----------
function DetailsTab({ product, lookups, onSaved, onClose, isNew }) {
  const [form, setForm] = useState({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    brandId:     product?.brandId     ?? '',
    categoryId:  product?.categoryId  ?? '',
    gender:      product?.gender      ?? 'unissex',
    price:       product?.price       ?? '',
    oldPrice:    product?.oldPrice    ?? '',
    installments: product?.installments ?? 1,
    image:       product?.image       ?? '',
    hoverImage:  product?.hoverImage  ?? '',
    isActive:    product?.isActive    ?? true,
    isNew:       product?.isNew       ?? false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr(null)
    try {
      let saved
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        installments: Number(form.installments) || 1,
      }
      if (isNew) saved = await createAdminProduct(payload)
      else       saved = await updateAdminProduct(product.id, payload)
      onSaved(saved?.id || product.id)
    } catch (e) { setErr(e.message) }
    finally { setSubmitting(false) }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Imagem principal */}
        <Field label="Imagem principal">
          <ImageUploader value={form.image} onChange={(v) => set('image', v)} size="lg" />
        </Field>

        <Field label="Imagem hover (aparece quando passa o mouse no card)">
          <ImageUploader value={form.hoverImage} onChange={(v) => set('hoverImage', v)} />
        </Field>

        <Field label="Nome *"><input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></Field>

        <Row>
          <Field label="Categoria *" className="flex-1">
            <select required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputCls}>
              <option value="">— selecionar —</option>
              {lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Marca *" className="flex-1">
            <select required value={form.brandId} onChange={(e) => set('brandId', e.target.value)} className={inputCls}>
              <option value="">— selecionar —</option>
              {lookups.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Gênero" className="flex-1">
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
              <option value="unissex">Unissex</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Preço (R$) *" className="flex-1"><input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="149.90" className={inputCls} /></Field>
          <Field label="Preço de R$ (opcional)" className="flex-1"><input type="number" step="0.01" min="0" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} placeholder="229.90" className={inputCls} /></Field>
          <Field label="Parcelas" className="flex-1"><input type="number" min="1" max="12" value={form.installments} onChange={(e) => set('installments', e.target.value)} className={inputCls} /></Field>
        </Row>

        <Field label="Descrição"><textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls + ' resize-none'} /></Field>

        <div className="flex flex-wrap gap-4 pt-2">
          <Toggle label="Ativo (visível na loja)" checked={form.isActive} onChange={(v) => set('isActive', v)} />
          <Toggle label="Marcar como novidade"   checked={form.isNew}    onChange={(v) => set('isNew', v)} />
        </div>

        {err && (
          <div className="flex items-start gap-2 p-3 border border-urban-red/40 bg-urban-red/10 rounded-sm text-xs text-white/90">
            <AlertTriangle size={14} className="text-urban-red mt-0.5 flex-shrink-0" />
            <span>{err}</span>
          </div>
        )}
      </form>

      <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-urban-border">
        <span className="text-[11px] text-urban-muted">{isNew ? 'Após salvar, gerencie variantes (cor + tamanho).' : 'Use a aba VARIANTES para estoque.'}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white">CANCELAR</button>
          <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center gap-2 px-5 h-10 bg-urban-red hover:bg-urban-red-hover disabled:opacity-50 rounded-md text-xs font-semibold tracking-widest">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> SALVANDO…</> : 'SALVAR'}
          </button>
        </div>
      </div>
    </>
  )
}

// ---------- Tab VARIANTES ----------
function VariantsTab({ productId, lookups, onClose }) {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [adding, setAdding] = useState({ colorId: '', sizeId: '', stock: 0 })

  const reload = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminProduct(productId)
      setVariants(data.variants || [])
      setErr(null)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { reload() }, [productId])

  const handleAdd = async () => {
    if (!adding.colorId && !adding.sizeId) { setErr('Selecione cor e/ou tamanho.'); return }
    try {
      await createAdminVariant(productId, {
        colorId: adding.colorId || null,
        sizeId:  adding.sizeId  || null,
        stock:   Number(adding.stock || 0),
      })
      setAdding({ colorId: '', sizeId: '', stock: 0 })
      reload()
    } catch (e) { setErr(e.message) }
  }

  const handleStockChange = async (id, stock) => {
    try {
      await patchAdminVariant(id, { stock: Number(stock) })
      setVariants((vs) => vs.map((v) => v.id === id ? { ...v, stock: Number(stock) } : v))
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir essa variante?')) return
    try {
      await deleteAdminVariant(id)
      reload()
    } catch (e) { alert(e.message) }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Adicionar nova */}
        <div className="bg-urban-card border border-urban-border rounded-md p-4">
          <h3 className="text-xs font-bold tracking-widest mb-3 flex items-center gap-2"><Plus size={13} /> ADICIONAR VARIANTE</h3>
          <Row>
            <Field label="Cor" className="flex-1">
              <select value={adding.colorId} onChange={(e) => setAdding((a) => ({ ...a, colorId: e.target.value }))} className={inputCls}>
                <option value="">— sem cor —</option>
                {lookups.colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tamanho" className="flex-1">
              <select value={adding.sizeId} onChange={(e) => setAdding((a) => ({ ...a, sizeId: e.target.value }))} className={inputCls}>
                <option value="">— sem tamanho —</option>
                {lookups.sizes.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.kind})</option>)}
              </select>
            </Field>
            <Field label="Estoque" className="w-32">
              <input type="number" min="0" value={adding.stock} onChange={(e) => setAdding((a) => ({ ...a, stock: e.target.value }))} className={inputCls} />
            </Field>
          </Row>
          <button onClick={handleAdd} className="mt-3 inline-flex items-center gap-2 px-4 h-9 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest">
            <Plus size={14} /> ADICIONAR
          </button>
        </div>

        {/* Lista */}
        <div>
          <h3 className="text-xs font-bold tracking-widest mb-3"><Box size={13} className="inline mr-1" /> VARIANTES ({variants.length})</h3>
          {loading ? (
            <div className="text-center text-urban-muted py-6"><Loader2 size={16} className="inline animate-spin mr-2" /> Carregando…</div>
          ) : err ? (
            <div className="text-center text-urban-red py-6"><AlertTriangle size={16} className="inline mr-2" /> {err}</div>
          ) : variants.length === 0 ? (
            <div className="text-center text-urban-muted py-6 border border-dashed border-urban-border rounded-md">
              Nenhuma variante. Adicione uma cor + tamanho acima.
            </div>
          ) : (
            <ul className="divide-y divide-urban-border/50 border border-urban-border rounded-md">
              {variants.map((v) => (
                <li key={v.id} className="flex items-center gap-3 p-3">
                  {v.colorHex && (
                    <span className="w-6 h-6 rounded-full border border-urban-border flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{v.colorName || '—'}{v.sizeLabel ? ` · ${v.sizeLabel}` : ''}</div>
                    <div className="text-[10px] text-urban-muted font-mono">{v.sku}</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => setVariants((vs) => vs.map((x) => x.id === v.id ? { ...x, stock: e.target.value } : x))}
                    onBlur={(e) => handleStockChange(v.id, e.target.value)}
                    className="w-20 bg-urban-card border border-urban-border rounded px-2 h-8 text-sm text-center"
                  />
                  <span className="text-[10px] text-urban-muted">un.</span>
                  <button onClick={() => handleDelete(v.id)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end px-5 py-3 border-t border-urban-border">
        <button onClick={onClose} className="px-5 h-10 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest">CONCLUIR</button>
      </div>
    </>
  )
}

// ---------- Auxiliares ----------
function StockBadge({ stock }) {
  if (stock === 0)  return <span className="text-xs px-2 py-1 rounded bg-red-500/15 text-red-400 font-bold border border-red-500/30">ESGOTADO</span>
  if (stock < 10)   return <span className="text-xs px-2 py-1 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">Baixo: {stock}</span>
  return <span className="text-sm">{stock}</span>
}

function Switch({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-urban-border'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <Switch checked={checked} onChange={() => onChange(!checked)} />
      <span className="text-sm">{label}</span>
    </label>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function Row({ children }) {
  return <div className="flex flex-col sm:flex-row gap-3">{children}</div>
}

function Loading()    { return <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</div> }
function ErrorBox({ message }) { return <div className="bg-urban-card/50 border border-urban-red/40 rounded-lg p-6 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {message}</div> }
function Empty()      { return <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted">Nenhum produto.</div> }

const inputCls = 'w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60'
