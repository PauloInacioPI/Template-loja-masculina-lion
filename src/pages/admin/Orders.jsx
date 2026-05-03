// =====================================================================
//  /admin/pedidos — lista real do banco + drawer de detalhe + status
// =====================================================================

import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, Download, MoreVertical, X, Phone, Mail, MapPin, MessageCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useAdminOrders } from '../../hooks/useAdminOrders'
import { fetchAdminOrder, patchAdminOrderStatus } from '../../lib/api'
import { StatusBadge } from './Dashboard'

const formatBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_TABS = [
  { id: 'all',       label: 'Todos' },
  { id: 'pending',   label: 'Aguardando' },
  { id: 'paid',      label: 'Pagos' },
  { id: 'shipping',  label: 'Enviados' },
  { id: 'delivered', label: 'Entregues' },
  { id: 'canceled',  label: 'Cancelados' },
]

export default function AdminOrders() {
  const { orders, loading, error, refetch } = useAdminOrders()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [openOrderId, setOpenOrderId] = useState(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (query) {
        const q = query.toLowerCase()
        if (!o.code.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [query, status, orders])

  const counts = useMemo(() => {
    const out = { all: orders.length }
    for (const o of orders) out[o.status] = (out[o.status] || 0) + 1
    return out
  }, [orders])

  const fmtDate = (s) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Pedidos</h1>
          <p className="text-sm text-urban-muted mt-1">{orders.length} pedidos · gerenciar status, ver detalhes.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white"><Download size={14} /> EXPORTAR CSV</button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
        {STATUS_TABS.map((t) => {
          const active = status === t.id
          return (
            <button
              key={t.id}
              onClick={() => setStatus(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                active ? 'bg-white text-urban-bg' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
              {counts[t.id] != null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-urban-bg/20' : 'bg-urban-card border border-urban-border'}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
          <input
            type="text"
            placeholder="Buscar por código ou cliente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-3 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-3 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white"><Filter size={14} /> FILTROS</button>
      </div>

      {loading && <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted"><Loader2 size={18} className="inline animate-spin mr-2" /> Carregando…</div>}
      {error   && <div className="bg-urban-card/50 border border-urban-red/40 rounded-lg p-6 text-center text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {error}</div>}

      {!loading && !error && (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-urban-card/50 border border-urban-border rounded-lg p-6 text-center text-urban-muted">Nenhum pedido.</div>
            ) : filtered.map((o) => (
              <button key={o.id} onClick={() => setOpenOrderId(o.id)} className="w-full text-left bg-urban-card/50 border border-urban-border rounded-lg p-4 hover:border-white/30">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-mono text-xs">{o.code}</div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-sm font-medium">{o.customer}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-urban-muted">
                  <span>{o.items} {o.items === 1 ? 'item' : 'itens'} · <span className="uppercase">{o.payment}</span></span>
                  <span className="text-white font-bold">{formatBRL(o.total)}</span>
                </div>
                <div className="mt-1 text-[11px] text-urban-muted">{fmtDate(o.createdAt)}</div>
              </button>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block bg-urban-card/50 border border-urban-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-urban-border bg-urban-bg/30">
                <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
                  <th className="text-left px-5 py-3">PEDIDO</th>
                  <th className="text-left px-5 py-3">CLIENTE</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">ITENS</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">PAGAMENTO</th>
                  <th className="text-left px-5 py-3">TOTAL</th>
                  <th className="text-left px-5 py-3">STATUS</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">DATA</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-urban-border/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-urban-muted">Nenhum pedido.</td></tr>
                ) : filtered.map((o) => (
                  <tr key={o.id} onClick={() => setOpenOrderId(o.id)} className="cursor-pointer hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono text-xs">{o.code}</td>
                    <td className="px-5 py-3.5">{o.customer}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-urban-muted">{o.items}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell uppercase text-xs text-urban-muted">{o.payment}</td>
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{formatBRL(o.total)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-urban-muted">{fmtDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5"><button className="text-urban-muted hover:text-white" onClick={(e) => e.stopPropagation()}><MoreVertical size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {openOrderId && (
        <OrderDetailDrawer
          orderId={openOrderId}
          onClose={() => setOpenOrderId(null)}
          onChanged={() => { refetch() }}
        />
      )}
    </div>
  )
}

// ---------- Drawer ----------
function OrderDetailDrawer({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAdminOrder(orderId)
      .then((d) => { if (!cancelled) setOrder(d) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])

  const changeStatus = async (newStatus) => {
    if (!order) return
    setUpdating(true)
    try {
      await patchAdminOrderStatus(orderId, newStatus)
      setOrder({ ...order, status: newStatus })
      onChanged()
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <aside className="relative ml-auto w-full sm:max-w-xl bg-urban-bg border-l border-urban-border h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 h-14 border-b border-urban-border bg-urban-bg">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold">{order?.code || '...'}</span>
            {order && <StatusBadge status={order.status} />}
          </div>
          <button onClick={onClose} className="text-urban-muted hover:text-white"><X size={20} /></button>
        </div>

        {loading || !order ? (
          <div className="p-10 text-center text-urban-muted"><Loader2 size={20} className="inline animate-spin mr-2" /> Carregando…</div>
        ) : (
          <div className="p-5 space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBtn label="MARCAR PAGO"     onClick={() => changeStatus('paid')}      disabled={updating || order.status === 'paid'}      cls="bg-emerald-600 hover:bg-emerald-500" />
              <StatusBtn label="MARCAR ENVIADO"  onClick={() => changeStatus('shipping')}  disabled={updating || order.status === 'shipping'}  cls="bg-blue-600 hover:bg-blue-500" />
              <StatusBtn label="MARCAR ENTREGUE" onClick={() => changeStatus('delivered')} disabled={updating || order.status === 'delivered'} cls="border border-urban-border hover:border-white text-white/80" />
              <StatusBtn label="CANCELAR"        onClick={() => changeStatus('canceled')}  disabled={updating || order.status === 'canceled'}  cls="border border-urban-red/40 text-urban-red hover:bg-urban-red/10" />
            </div>

            <Section title="CLIENTE">
              <div className="space-y-1.5 text-sm">
                <div className="font-semibold">{order.customer.name}</div>
                <div className="flex items-center gap-2 text-urban-muted flex-wrap">
                  <Phone size={13} /><span>{order.customer.phone}</span>
                  <a href={`https://wa.me/${String(order.customer.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-xs"><MessageCircle size={12} /> WhatsApp</a>
                </div>
                {order.customer.email && <div className="flex items-center gap-2 text-urban-muted"><Mail size={13} /> {order.customer.email}</div>}
                {order.customer.cpf   && <div className="text-urban-muted text-xs">CPF: {order.customer.cpf}</div>}
              </div>
            </Section>

            <Section title="ENTREGA">
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-urban-muted mt-0.5 flex-shrink-0" />
                <div>
                  <div>{order.shipping.address}</div>
                  <div className="text-urban-muted">{order.shipping.neighborhood} · {order.shipping.city}</div>
                  <div className="text-urban-muted text-xs">CEP: {order.shipping.cep}</div>
                </div>
              </div>
            </Section>

            <Section title={`ITENS · ${order.items.length}`}>
              <ul className="divide-y divide-urban-border/50">
                {order.items.map((it, i) => (
                  <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-14 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-urban-card">
                      {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium uppercase">{it.name}</div>
                      <div className="text-[11px] text-urban-muted mt-0.5">
                        {it.color} · {it.size} · {it.qty}x {formatBRL(it.unitPrice)}
                      </div>
                    </div>
                    <div className="text-sm font-bold whitespace-nowrap">{formatBRL(it.lineTotal)}</div>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="pt-4 border-t border-urban-border space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatBRL(order.totals.subtotal)} />
              <Row label="Frete"    value={order.totals.shipping === 0 ? 'GRÁTIS' : formatBRL(order.totals.shipping)} />
              {order.totals.discount > 0 && <Row label="Desconto" value={`-${formatBRL(order.totals.discount)}`} />}
              <div className="pt-3 mt-2 border-t border-urban-border flex items-baseline justify-between">
                <span className="text-xs text-urban-muted">TOTAL</span>
                <span className="text-2xl font-bold">{formatBRL(order.totals.total)}</span>
              </div>
            </div>

            {order.notes && (
              <Section title="OBSERVAÇÕES"><p className="text-sm text-white/85">{order.notes}</p></Section>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

function StatusBtn({ label, cls = '', ...rest }) {
  return <button {...rest} className={`px-3 h-9 rounded-md text-xs font-semibold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}>{label}</button>
}
function Section({ title, children }) {
  return <section><h4 className="text-[10px] font-bold tracking-widest text-urban-muted mb-3">{title}</h4>{children}</section>
}
function Row({ label, value }) {
  return <div className="flex items-baseline justify-between"><span className="text-urban-muted">{label}</span><span>{value}</span></div>
}
