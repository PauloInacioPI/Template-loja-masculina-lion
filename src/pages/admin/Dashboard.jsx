// =====================================================================
//  /admin — Dashboard com dados reais do banco
// =====================================================================

import { Link } from 'react-router-dom'
import {
  ShoppingCart, DollarSign, Users, Package, TrendingUp, TrendingDown,
  ArrowRight, MoreVertical, Calendar, Loader2, AlertTriangle
} from 'lucide-react'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'

const formatBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (s) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function AdminDashboard() {
  const { stats, salesChart, topProducts, recentOrders, loading, error } = useAdminDashboard()

  if (loading) {
    return <div className="bg-urban-card/50 border border-urban-border rounded-lg p-10 text-center text-urban-muted"><Loader2 size={20} className="inline animate-spin mr-2" /> Carregando dashboard…</div>
  }
  if (error) {
    return <div className="bg-urban-card/50 border border-urban-red/40 rounded-lg p-10 text-center text-urban-red"><AlertTriangle size={20} className="inline mr-2" /> {error}</div>
  }

  const maxChartValue = Math.max(1, ...salesChart.map((d) => d.value))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-urban-muted mt-1">Visão geral da loja — atualizado agora.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 h-10 border border-urban-border rounded-md text-xs font-semibold tracking-widest hover:border-white"><Calendar size={14} /> ÚLTIMOS 7 DIAS</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingCart size={16} />} color="bg-urban-red/15 text-urban-red"
          label="Pedidos Hoje" value={stats?.ordersToday ?? 0} />
        <StatCard icon={<DollarSign size={16} />} color="bg-emerald-500/15 text-emerald-400"
          label="Faturamento Hoje" value={formatBRL(stats?.revenueToday)} />
        <StatCard icon={<Users size={16} />} color="bg-blue-500/15 text-blue-400"
          label="Clientes" value={stats?.totalCustomers ?? 0}
          sub={`+${stats?.newCustomers ?? 0} hoje`} />
        <StatCard icon={<Package size={16} />} color="bg-purple-500/15 text-purple-400"
          label="Em Estoque" value={(stats?.stockUnits ?? 0).toLocaleString('pt-BR')}
          sub={`${stats?.variantsLow ?? 0} variantes em alerta`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="xl:col-span-2 bg-urban-card/50 border border-urban-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold tracking-widest">VENDAS · 7 DIAS</h2>
              <div className="text-xs text-urban-muted mt-0.5">
                Total: <strong className="text-white">{formatBRL(salesChart.reduce((s, d) => s + d.value, 0))}</strong>
              </div>
            </div>
            <button className="text-urban-muted hover:text-white"><MoreVertical size={16} /></button>
          </div>

          <div className="flex items-end justify-between gap-2 sm:gap-3 h-48 sm:h-56">
            {salesChart.map((d, i) => {
              const h = (d.value / maxChartValue) * 100
              const isMax = d.value > 0 && d.value === maxChartValue
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group flex-1 flex items-end">
                    <div style={{ height: `${h}%` }} className={`w-full rounded-sm transition-all duration-500 ${isMax ? 'bg-urban-red' : 'bg-urban-border hover:bg-white/30'}`} />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black border border-urban-border text-[10px] px-2 py-1 rounded whitespace-nowrap">{formatBRL(d.value)}</div>
                  </div>
                  <span className="text-[10px] text-urban-muted">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top produtos */}
        <div className="bg-urban-card/50 border border-urban-border rounded-lg p-5">
          <h2 className="text-sm font-bold tracking-widest mb-4">TOP PRODUTOS</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-urban-muted">Sem vendas ainda.</p>
          ) : (
            <ul className="space-y-3.5">
              {topProducts.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 grid place-items-center rounded-md bg-urban-bg text-[11px] font-bold text-urban-muted">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-urban-muted">{p.sales} vendas</div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 whitespace-nowrap">{formatBRL(p.revenue)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-urban-card/50 border border-urban-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-urban-border">
          <h2 className="text-sm font-bold tracking-widest">PEDIDOS RECENTES</h2>
          <Link to="/admin/pedidos" className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-urban-muted hover:text-white">VER TODOS <ArrowRight size={12} /></Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-urban-muted">Sem pedidos ainda.</div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-urban-border/50">
              {recentOrders.map((o) => (
                <div key={o.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-mono text-xs">{o.code}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-sm font-medium">{o.customer}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-urban-muted">
                    <span>{o.items} {o.items === 1 ? 'item' : 'itens'}</span>
                    <span className="text-white font-bold">{formatBRL(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <table className="hidden sm:table w-full text-sm">
              <thead className="border-b border-urban-border bg-urban-bg/30">
                <tr className="text-[10px] font-bold tracking-widest text-urban-muted">
                  <th className="text-left px-5 py-3">PEDIDO</th>
                  <th className="text-left px-5 py-3">CLIENTE</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">ITENS</th>
                  <th className="text-left px-5 py-3">TOTAL</th>
                  <th className="text-left px-5 py-3">STATUS</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-urban-border/50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono text-xs">{o.code}</td>
                    <td className="px-5 py-3.5">{o.customer}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-urban-muted">{o.items}</td>
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{formatBRL(o.total)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs text-urban-muted">{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, color, label, value, delta, deltaUp, sub }) {
  return (
    <div className="bg-urban-card/50 border border-urban-border rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 grid place-items-center rounded-md ${color}`}>{icon}</div>
        {delta && (
          <span className={`text-[11px] font-bold inline-flex items-center gap-0.5 ${deltaUp ? 'text-emerald-400' : 'text-urban-red'}`}>
            {deltaUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {delta}
          </span>
        )}
      </div>
      <div className="text-xs text-urban-muted mb-1">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-urban-muted mt-1">{sub}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'Aguardando', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    paid:      { label: 'Pago',       cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    shipping:  { label: 'Enviado',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    delivered: { label: 'Entregue',   cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    canceled:  { label: 'Cancelado',  cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  }
  const s = map[status] || map.pending
  return <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded border ${s.cls}`}>{s.label}</span>
}
