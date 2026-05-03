// =====================================================================
//  /admin/cupons — CRUD de cupons de desconto
// =====================================================================

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Loader2, AlertTriangle, Save, Tag } from 'lucide-react'
import { fetchAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon } from '../../lib/api'

const formatBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AdminCoupons() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  const reload = async () => {
    setLoading(true)
    try { setRows(await fetchAdminCoupons()); setError(null) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [])

  const handleDelete = async (c) => {
    if (!confirm(`Excluir cupom ${c.code}?`)) return
    try { await deleteAdminCoupon(c.id); reload() } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Cupons</h1>
          <p className="text-sm text-urban-muted mt-1">{rows.length} cupons cadastrados.</p>
        </div>
        <button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 px-4 h-10 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest">
          <Plus size={15} /> NOVO CUPOM
        </button>
      </div>

      {loading ? (
        <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</div>
      ) : error ? (
        <div className="bg-urban-card/50 border border-urban-red/40 rounded-lg p-6 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-urban-card/50 border border-urban-border rounded-lg p-12 text-center text-urban-muted">
          <Tag size={32} className="mx-auto mb-3 opacity-50" />
          Nenhum cupom criado ainda.
        </div>
      ) : (
        <div className="bg-urban-card/40 border border-urban-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-urban-bg/30 border-b border-urban-border">
              <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
                <th className="text-left px-5 py-3">CÓDIGO</th>
                <th className="text-left px-5 py-3">TIPO</th>
                <th className="text-left px-5 py-3">VALOR</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">MÍN. SUBTOTAL</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">USOS</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">VÁLIDO ATÉ</th>
                <th className="text-left px-5 py-3">ATIVO</th>
                <th className="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-urban-border/50">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5"><span className="font-mono font-bold">{c.code}</span></td>
                  <td className="px-5 py-3.5">{c.kind === 'percent' ? '% Percentual' : 'R$ Fixo'}</td>
                  <td className="px-5 py-3.5 font-semibold">
                    {c.kind === 'percent' ? `${c.amount}%` : formatBRL(c.amount)}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-urban-muted">{formatBRL(c.min_subtotal)}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-urban-muted">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-urban-muted">{c.valid_until || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${c.is_active ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-urban-border/50 text-urban-muted border-urban-border'}`}>
                      {c.is_active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(c)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-white"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(c)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <CouponFormModal coupon={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </div>
  )
}

function CouponFormModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState({
    code:         coupon?.code         ?? '',
    kind:         coupon?.kind         ?? 'percent',
    amount:       coupon?.amount       ?? '',
    min_subtotal: coupon?.min_subtotal ?? 0,
    max_uses:     coupon?.max_uses     ?? '',
    valid_until:  coupon?.valid_until  ?? '',
    is_active:    coupon?.is_active    ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      const payload = { ...form, max_uses: form.max_uses || null, valid_until: form.valid_until || null }
      if (coupon) await updateAdminCoupon(coupon.id, payload)
      else        await createAdminCoupon(payload)
      onSaved()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:mx-4 bg-urban-bg sm:rounded-lg border border-urban-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-urban-border">
          <h2 className="text-sm font-bold tracking-widest">{coupon ? 'EDITAR CUPOM' : 'NOVO CUPOM'}</h2>
          <button onClick={onClose} className="text-urban-muted hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="flex-1 p-5 space-y-4 overflow-y-auto">
          <Field label="Código *"><input required value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="LION10" className={inputCls} /></Field>
          <Row>
            <Field label="Tipo *">
              <select value={form.kind} onChange={(e) => set('kind', e.target.value)} className={inputCls}>
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </Field>
            <Field label={form.kind === 'percent' ? 'Valor (%)' : 'Valor (R$)'}>
              <input type="number" step="0.01" min="0" required value={form.amount} onChange={(e) => set('amount', e.target.value)} className={inputCls} />
            </Field>
          </Row>
          <Row>
            <Field label="Mín. subtotal (R$)"><input type="number" step="0.01" min="0" value={form.min_subtotal} onChange={(e) => set('min_subtotal', e.target.value)} className={inputCls} /></Field>
            <Field label="Limite de usos (opcional)"><input type="number" min="0" value={form.max_uses} onChange={(e) => set('max_uses', e.target.value)} className={inputCls} placeholder="ilimitado" /></Field>
          </Row>
          <Field label="Válido até (opcional)"><input type="date" value={form.valid_until} onChange={(e) => set('valid_until', e.target.value)} className={inputCls} /></Field>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <button type="button" onClick={() => set('is_active', !form.is_active)} className={`relative w-10 h-5 rounded-full ${form.is_active ? 'bg-emerald-500' : 'bg-urban-border'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm">Ativo</span>
          </label>
          {err && <div className="flex items-start gap-2 p-3 border border-urban-red/40 bg-urban-red/10 rounded-sm text-xs text-white/90"><AlertTriangle size={14} className="text-urban-red mt-0.5" /><span>{err}</span></div>}
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

function Field({ label, children }) {
  return <label className="block"><span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">{label}</span>{children}</label>
}
function Row({ children }) { return <div className="flex flex-col sm:flex-row gap-3 [&>*]:flex-1">{children}</div> }
const inputCls = 'w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60'
