import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useStore } from '../context/StoreContext'

const NAV = [
  { label: 'NOVIDADES',   to: '/produtos?novos=1' },
  { label: 'MASCULINO',   to: '/produtos?genero=masculino' },
  { label: 'FEMININO',    to: '/produtos?genero=feminino' },
  { label: 'ACESSÓRIOS',  to: '/produtos?tipo=bones,beanies,mochilas' },
  { label: 'TÊNIS',       to: '/produtos?tipo=tenis' },
  { label: 'SALE',        to: '/produtos?promocao=1', sale: true },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { count, openCart } = useStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname, location.search])

  return (
    <header
      className={`sticky top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'bg-urban-bg/95 backdrop-blur-md border-b border-urban-border'
          : 'bg-urban-bg border-b border-urban-border/40'
      }`}
    >
      {/* Main row */}
      <div className="container-x flex items-center gap-6 h-16 sm:h-[72px]">
        <Logo />

        {/* Search bar (desktop) */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex flex-1 max-w-xl mx-auto"
        >
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-urban-muted" />
            <input
              type="text"
              placeholder="Buscar por produto, marca ou coleção…"
              className="w-full bg-urban-card border border-urban-border rounded-full pl-11 pr-4 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60 transition-colors"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
          <IconBtn label="Buscar" mdHide onClick={() => setSearchOpen((v) => !v)}>
            <Search size={18} />
          </IconBtn>
          <IconBtn label="Conta" hideOnMobile><User size={18} /></IconBtn>
          <IconBtn label="Favoritos" hideOnMobile><Heart size={18} /></IconBtn>
          <IconBtn label="Sacola" badge={count > 0 ? String(count) : null} onClick={openCart}>
            <ShoppingBag size={18} />
          </IconBtn>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden ml-1 w-9 h-9 grid place-items-center text-white/80 hover:text-white"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Search (mobile collapsible) */}
      {searchOpen && (
        <div className="md:hidden border-t border-urban-border bg-urban-bg">
          <div className="container-x py-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-urban-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar…"
                className="w-full bg-urban-card border border-urban-border rounded-full pl-11 pr-4 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nav row (desktop) */}
      <nav className="hidden lg:block border-t border-urban-border/60">
        <div className="container-x flex items-center justify-center gap-9 h-11">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-[11px] font-semibold tracking-[0.18em] transition-colors relative group ${
                item.sale ? 'text-urban-red' : 'text-white/80 hover:text-white'
              }`}
            >
              {item.label}
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-urban-red transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 bg-urban-card border-t border-urban-border ${
          mobileOpen ? 'max-h-[420px]' : 'max-h-0'
        }`}
      >
        <nav className="container-x flex flex-col py-2">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`py-3.5 text-sm font-semibold tracking-[0.15em] border-b border-urban-border/40 last:border-0 ${
                item.sale ? 'text-urban-red' : 'text-white/85'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

function IconBtn({ children, label, badge, onClick, mdHide, hideOnMobile }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full text-white/85 hover:text-white hover:bg-white/5 transition-colors ${
        mdHide ? 'md:hidden' : ''
      } ${hideOnMobile ? 'hidden sm:grid' : ''}`}
    >
      {children}
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-urban-red text-[10px] font-bold grid place-items-center">
          {badge}
        </span>
      )}
    </button>
  )
}
