// =====================================================================
//  AdminLayout — sidebar retrátil (desktop) + drawer mobile
// =====================================================================

import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart3,
  Layers, Tag,
  Bell, Search, ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Menu, X
} from 'lucide-react'
import { mockUser } from './_mock'

const NAV = [
  { to: '/admin',               label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos',       label: 'Pedidos',       icon: ShoppingBag },
  { to: '/admin/produtos',      label: 'Produtos',      icon: Package },
  { to: '/admin/catalogo',      label: 'Catálogo',      icon: Layers },
  { to: '/admin/clientes',      label: 'Clientes',      icon: Users },
  { to: '/admin/cupons',        label: 'Cupons',        icon: Tag },
  { to: '/admin/relatorios',    label: 'Relatórios',    icon: BarChart3 },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

const STORAGE_KEY = 'admin.sidebar.collapsed'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const handleLogout = () => {
    // TODO: limpar token e fazer logout real
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* Sidebar (desktop) */}
      <aside className={`hidden lg:flex ${collapsed ? 'w-[68px]' : 'w-60'} flex-col border-r border-urban-border bg-urban-card/50 sticky top-0 h-screen transition-[width] duration-200`}>
        <SidebarContent collapsed={collapsed} onNavigate={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/70" />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-urban-card border-r border-urban-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent collapsed={false} onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-urban-border bg-[#0a0e1a]/95 backdrop-blur">
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-16">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 grid place-items-center rounded-md hover:bg-white/5"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>

            {/* Toggle collapsed (desktop) */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:grid w-9 h-9 place-items-center rounded-md hover:bg-white/5 text-urban-muted hover:text-white"
              aria-label="Recolher menu"
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
                <input
                  type="text"
                  placeholder="Buscar pedido, produto, cliente…"
                  className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-4 h-9 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60 transition-colors"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button className="relative w-9 h-9 grid place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/5">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-urban-red rounded-full" />
              </button>

              <UserMenu user={mockUser} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-3 sm:px-6 py-5 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, onNavigate, onLogout }) {
  return (
    <>
      {/* Brand */}
      <div className={`h-16 flex items-center border-b border-urban-border ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <Link to="/admin" className="flex items-center gap-2.5">
          <img src="/lion-logo-white.png" alt="" className="w-8 h-8 object-contain flex-shrink-0" />
          {!collapsed && (
            <div>
              <div className="font-display tracking-[0.2em] text-base leading-tight">LION</div>
              <div className="text-[9px] tracking-[0.25em] text-urban-muted leading-tight">ADMIN</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'} space-y-0.5`}>
        {!collapsed && (
          <div className="text-[10px] font-bold tracking-widest text-urban-muted px-3 mb-2">GERAL</div>
        )}
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-md text-sm transition-colors relative ${
                isActive
                  ? 'bg-urban-red/10 text-urban-red font-semibold'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={16} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-urban-red text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-urban-red" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User strip */}
      <div className="border-t border-urban-border p-3">
        <div className={`flex items-center gap-3 p-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-urban-red grid place-items-center text-[11px] font-bold flex-shrink-0">
            {mockUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{mockUser.name}</div>
                <div className="text-[10px] text-urban-muted truncate">{mockUser.email}</div>
              </div>
              <button
                onClick={onLogout}
                aria-label="Sair"
                className="w-8 h-8 grid place-items-center rounded-md text-urban-muted hover:text-urban-red hover:bg-urban-red/10"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5"
      >
        <div className="w-8 h-8 rounded-full bg-urban-red grid place-items-center text-[11px] font-bold">
          {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <ChevronDown size={14} className="hidden sm:block text-urban-muted" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 top-full mt-1 w-56 bg-urban-card border border-urban-border rounded-md shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-urban-border">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-urban-muted">{user.email}</div>
              <span className="mt-1.5 inline-block text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-urban-red/15 text-urban-red">
                {user.role.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/85 hover:bg-white/5"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}
