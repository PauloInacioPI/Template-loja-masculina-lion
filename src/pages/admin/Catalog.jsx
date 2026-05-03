// =====================================================================
//  /admin/catalogo — CRUD de Categorias, Marcas, Cores, Tamanhos
// =====================================================================

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Loader2, AlertTriangle, Tag, Award, Palette, Ruler } from 'lucide-react'
import {
  fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  fetchAdminBrands,     createAdminBrand,    updateAdminBrand,    deleteAdminBrand,
  fetchAdminColors,     createAdminColor,    updateAdminColor,    deleteAdminColor,
  fetchAdminSizes,      createAdminSize,     updateAdminSize,     deleteAdminSize,
} from '../../lib/api'

const TABS = [
  { id: 'categories', label: 'Categorias', icon: Tag },
  { id: 'brands',     label: 'Marcas',     icon: Award },
  { id: 'colors',     label: 'Cores',      icon: Palette },
  { id: 'sizes',      label: 'Tamanhos',   icon: Ruler },
]

export default function AdminCatalog() {
  const [tab, setTab] = useState('categories')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Catálogo</h1>
        <p className="text-sm text-urban-muted mt-1">Categorias, marcas, cores e tamanhos.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-urban-border">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-2 px-3 h-10 text-xs font-semibold tracking-widest border-b-2 transition-colors ${
            tab === t.id ? 'border-urban-red text-white' : 'border-transparent text-urban-muted hover:text-white'
          }`}>
            <t.icon size={14} /> {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'categories' && <CategoriesTab />}
      {tab === 'brands'     && <BrandsTab />}
      {tab === 'colors'     && <ColorsTab />}
      {tab === 'sizes'      && <SizesTab />}
    </div>
  )
}

// ===================== CATEGORIES =====================
function CategoriesTab() {
  return <CrudTable
    title="Categorias"
    fetchFn={fetchAdminCategories}
    createFn={createAdminCategory}
    updateFn={updateAdminCategory}
    deleteFn={deleteAdminCategory}
    columns={[
      { key: 'name', label: 'Nome', placeholder: 'Camisetas' },
      { key: 'slug', label: 'Slug', placeholder: 'camisetas (gerado se vazio)' },
    ]}
  />
}

function BrandsTab() {
  return <CrudTable
    title="Marcas"
    fetchFn={fetchAdminBrands}
    createFn={createAdminBrand}
    updateFn={updateAdminBrand}
    deleteFn={deleteAdminBrand}
    columns={[
      { key: 'name', label: 'Nome', placeholder: 'LION' },
      { key: 'slug', label: 'Slug', placeholder: 'lion (gerado se vazio)' },
    ]}
  />
}

function ColorsTab() {
  return <CrudTable
    title="Cores"
    fetchFn={fetchAdminColors}
    createFn={createAdminColor}
    updateFn={updateAdminColor}
    deleteFn={deleteAdminColor}
    columns={[
      { key: 'name', label: 'Nome', placeholder: 'Preto' },
      { key: 'slug', label: 'Slug', placeholder: 'black' },
      { key: 'hex',  label: 'Cor (hex)', placeholder: '#0a0a0a', kind: 'color' },
    ]}
  />
}

function SizesTab() {
  return <CrudTable
    title="Tamanhos"
    fetchFn={fetchAdminSizes}
    createFn={createAdminSize}
    updateFn={updateAdminSize}
    deleteFn={deleteAdminSize}
    columns={[
      { key: 'label',     label: 'Tamanho',    placeholder: 'P / M / G / 42' },
      { key: 'kind',      label: 'Tipo',       kind: 'select', options: [['clothing','Roupa'],['shoe','Calçado'],['unique','Único']] },
      { key: 'sort_order', label: 'Ordem',     placeholder: '0', kind: 'number' },
    ]}
  />
}

// ===================== Tabela CRUD genérica =====================
function CrudTable({ title, fetchFn, createFn, updateFn, deleteFn, columns }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | rowObject

  const reload = async () => {
    setLoading(true)
    try {
      setRows(await fetchFn())
      setError(null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { reload() }, [])

  const handleDelete = async (r) => {
    if (!confirm(`Excluir "${r.name || r.label}"?`)) return
    try { await deleteFn(r.id); reload() } catch (e) { alert(e.message) }
  }

  return (
    <div className="bg-urban-card/40 border border-urban-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-urban-border">
        <h3 className="text-sm font-bold tracking-widest">{title.toUpperCase()} · {rows.length}</h3>
        <button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 px-3 h-9 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest"><Plus size={13} /> ADICIONAR</button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</div>
      ) : error ? (
        <div className="p-6 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {error}</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-urban-muted">Vazio.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-urban-bg/30 border-b border-urban-border">
            <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
              {columns.map((c) => <th key={c.key} className="text-left px-5 py-3">{c.label.toUpperCase()}</th>)}
              <th className="px-5 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-urban-border/50">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3.5 text-sm">
                    {c.key === 'hex' && r[c.key] ? (
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full border border-urban-border" style={{ backgroundColor: r[c.key] }} />
                        <span className="font-mono text-xs">{r[c.key]}</span>
                      </div>
                    ) : c.kind === 'select' && c.options ? (
                      (c.options.find(([v]) => v === r[c.key]) || [])[1] || r[c.key]
                    ) : (
                      r[c.key] ?? '—'
                    )}
                  </td>
                ))}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(r)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-white"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(r)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <CrudFormModal
          row={editing === 'new' ? null : editing}
          columns={columns}
          createFn={createFn}
          updateFn={updateFn}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }}
        />
      )}
    </div>
  )
}

function CrudFormModal({ row, columns, createFn, updateFn, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const f = {}
    for (const c of columns) f[c.key] = row?.[c.key] ?? (c.kind === 'number' ? 0 : '')
    return f
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      if (row) await updateFn(row.id, form)
      else     await createFn(form)
      onSaved()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-md sm:mx-4 bg-urban-bg sm:rounded-lg border border-urban-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-urban-border">
          <h2 className="text-sm font-bold tracking-widest">{row ? 'EDITAR' : 'NOVO'}</h2>
          <button onClick={onClose} className="text-urban-muted hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="flex-1 p-5 space-y-4">
          {columns.map((c) => (
            <label key={c.key} className="block">
              <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">{c.label}</span>
              {c.kind === 'color' ? (
                <div className="flex gap-2 items-center">
                  <input type="color" value={form[c.key] || '#000000'} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} className="w-12 h-11 bg-urban-card border border-urban-border rounded cursor-pointer" />
                  <input value={form[c.key] || ''} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} placeholder={c.placeholder} className={inputCls} />
                </div>
              ) : c.kind === 'select' ? (
                <select value={form[c.key] || ''} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} className={inputCls}>
                  {c.options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
              ) : c.kind === 'number' ? (
                <input type="number" value={form[c.key] ?? 0} onChange={(e) => setForm((f) => ({ ...f, [c.key]: Number(e.target.value) }))} className={inputCls} />
              ) : (
                <input value={form[c.key] || ''} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} placeholder={c.placeholder} className={inputCls} />
              )}
            </label>
          ))}
          {err && (
            <div className="flex items-start gap-2 p-3 border border-urban-red/40 bg-urban-red/10 rounded-sm text-xs text-white/90">
              <AlertTriangle size={14} className="text-urban-red mt-0.5 flex-shrink-0" /><span>{err}</span>
            </div>
          )}
        </form>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-urban-border">
          <button type="button" onClick={onClose} className="px-4 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white">CANCELAR</button>
          <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 px-5 h-10 bg-urban-red hover:bg-urban-red-hover disabled:opacity-50 rounded-md text-xs font-semibold tracking-widest">
            {saving ? <><Loader2 size={14} className="animate-spin" /> SALVANDO…</> : <><Save size={13} /> SALVAR</>}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60'
