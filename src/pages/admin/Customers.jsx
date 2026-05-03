// =====================================================================
//  /admin/clientes — lista + cadastrar / editar / excluir
// =====================================================================

import { useMemo, useState } from 'react'
import { Search, Mail, Phone, MessageCircle, Plus, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react'
import { useAdminCustomers } from '../../hooks/useAdminCustomers'
import { createAdminCustomer, updateAdminCustomer, deleteAdminCustomer } from '../../lib/api'

const formatBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const onlyDigits = (s) => String(s || '').replace(/\D/g, '')
const fmtPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}
const fmtCPF = (v) => onlyDigits(v).slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const showPhone = (digits) => fmtPhone(digits)

export default function AdminCustomers() {
  const { customers, loading, error, refetch } = useAdminCustomers()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)  // null | 'new' | customerObject

  const filtered = useMemo(() => {
    if (!query) return customers
    const q = query.toLowerCase()
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q.replace(/\D/g, ''))
    )
  }, [query, customers])

  const handleDelete = async (c) => {
    if (!confirm(`Excluir ${c.name}?`)) return
    try {
      await deleteAdminCustomer(c.id)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Clientes</h1>
          <p className="text-sm text-urban-muted mt-1">
            {customers.length} clientes cadastrados.
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 px-4 h-10 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest"
        >
          <Plus size={15} /> NOVO CLIENTE
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-3 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
        />
      </div>

      {loading && <Loading />}
      {error   && <ErrorBox message={error} />}

      {!loading && !error && (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.length === 0 ? (
              <Empty />
            ) : (
              filtered.map((c) => (
                <div key={c.id} className="bg-urban-card/50 border border-urban-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={c.name} />
                    <div className="flex-1 font-semibold">{c.name}</div>
                    <button onClick={() => setEditing(c)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-white"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(c)} className="w-8 h-8 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-1.5 text-xs text-urban-muted">
                    <a href={`https://wa.me/${onlyDigits(c.phone)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400">
                      <MessageCircle size={12} /> {showPhone(c.phone)}
                    </a>
                    {c.email && <div className="flex items-center gap-2"><Mail size={12} /> {c.email}</div>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-urban-border/60 flex items-center justify-between text-xs">
                    <div><div className="text-urban-muted">Pedidos</div><div className="font-bold text-white">{c.orders}</div></div>
                    <div className="text-right"><div className="text-urban-muted">Total gasto</div><div className="font-bold text-emerald-400">{formatBRL(c.total)}</div></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block bg-urban-card/50 border border-urban-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-urban-border bg-urban-bg/30">
                <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
                  <th className="text-left px-5 py-3">CLIENTE</th>
                  <th className="text-left px-5 py-3">CONTATO</th>
                  <th className="text-left px-5 py-3">PEDIDOS</th>
                  <th className="text-left px-5 py-3">TOTAL GASTO</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">ÚLTIMO</th>
                  <th className="px-5 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-urban-border/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-urban-muted">Nenhum cliente.</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div className="font-medium">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <a href={`https://wa.me/${onlyDigits(c.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-urban-muted hover:text-emerald-400">
                        <MessageCircle size={12} /> {showPhone(c.phone)}
                      </a>
                      {c.email && (
                        <div className="flex items-center gap-1 text-[11px] text-urban-muted mt-0.5">
                          <Mail size={11} /> {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{c.orders}</td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-400 whitespace-nowrap">{formatBRL(c.total)}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-urban-muted">{c.lastOrder || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(c)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-white hover:bg-white/5"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(c)} className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-urban-red hover:bg-urban-red/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <CustomerFormModal
          customer={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch() }}
        />
      )}
    </div>
  )
}

// ---------- componentes ----------

function CustomerFormModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:  customer?.name  ?? '',
    phone: customer?.phone ? showPhone(customer.phone) : '',
    email: customer?.email ?? '',
    cpf:   customer?.cpf   ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr(null)
    try {
      const payload = { ...form, phone: onlyDigits(form.phone) }
      if (customer) await updateAdminCustomer(customer.id, payload)
      else          await createAdminCustomer(payload)
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-md sm:mx-4 max-h-[100vh] sm:max-h-[90vh] bg-urban-bg sm:rounded-lg border border-urban-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-urban-border">
          <h2 className="text-sm font-bold tracking-widest">{customer ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}</h2>
          <button onClick={onClose} className="text-urban-muted hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Nome completo *">
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Nome do cliente" />
          </Field>
          <Field label="Telefone / WhatsApp *">
            <input required value={form.phone} onChange={(e) => set('phone', fmtPhone(e.target.value))} className={inputCls} placeholder="(00) 00000-0000" />
          </Field>
          <Field label="E-mail (opcional)">
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="cliente@email.com" />
          </Field>
          <Field label="CPF (opcional)">
            <input value={form.cpf} onChange={(e) => set('cpf', fmtCPF(e.target.value))} className={inputCls} placeholder="000.000.000-00" />
          </Field>
          {err && (
            <div className="flex items-start gap-2 p-3 border border-urban-red/40 bg-urban-red/10 rounded-sm text-xs text-white/90">
              <AlertTriangle size={14} className="text-urban-red mt-0.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          )}
        </form>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-urban-border">
          <button type="button" onClick={onClose} className="px-4 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white">CANCELAR</button>
          <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center gap-2 px-5 h-10 bg-urban-red hover:bg-urban-red-hover disabled:opacity-50 rounded-md text-xs font-semibold tracking-widest">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> SALVANDO…</> : 'SALVAR'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-urban-red grid place-items-center text-[11px] font-bold flex-shrink-0">
      {name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function Loading()    { return <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</div> }
function ErrorBox({ message }) { return <div className="bg-urban-card/50 border border-urban-red/40 rounded-lg p-6 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {message}</div> }
function Empty()      { return <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted">Nenhum cliente.</div> }

const inputCls = 'w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60'
