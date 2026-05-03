import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronRight, X, PackageX, Loader2, AlertTriangle } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import FiltersSidebar from '../components/FiltersSidebar'
import SortBar from '../components/SortBar'
import FilterChips from '../components/FilterChips'
import TrustBar from '../components/TrustBar'
import { useProducts } from '../hooks/useProducts'

const PAGE_SIZE = 12

const EMPTY_FILTERS = {
  tipo: [], genero: [], cor: [], tamanho: [], marca: [],
  precoMin: '', precoMax: '', promocao: false, novos: false,
}

const parseList = (s) => (s ? s.split(',').filter(Boolean) : [])

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const { products: ALL, loading, error, refetch } = useProducts()

  const filters = useMemo(() => ({
    tipo:    parseList(params.get('tipo')),
    genero:  parseList(params.get('genero')),
    cor:     parseList(params.get('cor')),
    tamanho: parseList(params.get('tamanho')),
    marca:   parseList(params.get('marca')),
    precoMin:params.get('precoMin') || '',
    precoMax:params.get('precoMax') || '',
    promocao:params.get('promocao') === '1',
    novos:   params.get('novos') === '1',
  }), [params])

  const sort = params.get('ordem') || 'relevance'
  const [cols, setCols] = useState(4)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // reset visible items on filter/sort change
  useEffect(() => { setVisible(PAGE_SIZE) }, [params])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (Array.isArray(value)) {
      value.length ? next.set(key, value.join(',')) : next.delete(key)
    } else if (value === false || value === '' || value == null) {
      next.delete(key)
    } else if (value === true) {
      next.set(key, '1')
    } else {
      next.set(key, String(value))
    }
    setParams(next, { replace: true })
  }

  const onChange = {
    toggle: (key, val) => {
      const list = filters[key]
      const next = list.includes(val) ? list.filter((v) => v !== val) : [...list, val]
      updateParam(key, next)
    },
    set: (key, val) => updateParam(key, val),
  }

  const clearAll = () => setParams({}, { replace: true })

  const filtered = useMemo(() => {
    let list = ALL.filter((p) => {
      if (filters.tipo.length    && !filters.tipo.includes(p.type))     return false
      if (filters.genero.length  && !filters.genero.includes(p.gender)) return false
      if (filters.marca.length   && !filters.marca.includes(p.brand))   return false
      if (filters.cor.length     && !p.colors.some((c) => filters.cor.includes(c))) return false
      if (filters.tamanho.length && !p.sizes.some((s) => filters.tamanho.includes(s))) return false
      if (filters.precoMin && p.price < Number(filters.precoMin)) return false
      if (filters.precoMax && p.price > Number(filters.precoMax)) return false
      if (filters.promocao && !p.isSale) return false
      if (filters.novos    && !p.isNew)  return false
      return true
    })

    switch (sort) {
      case 'price-asc':  list = [...list].sort((a, b) => a.price - b.price); break
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'newest':     list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew)); break
      case 'best':       list = [...list].sort((a, b) => (b.reviews||0) - (a.reviews||0)); break
      case 'discount':   list = [...list].sort((a, b) => (b.discount||0) - (a.discount||0)); break
      default: break
    }
    return list
  }, [filters, sort])

  const totalActive =
    filters.tipo.length + filters.genero.length + filters.cor.length +
    filters.tamanho.length + filters.marca.length +
    (filters.precoMin || filters.precoMax ? 1 : 0) +
    (filters.promocao ? 1 : 0) + (filters.novos ? 1 : 0)

  const visibleItems = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  return (
    <>
      {/* Page header */}
      <div className="border-b border-urban-border">
        <div className="container-x py-7">
          <nav className="flex items-center gap-1.5 text-xs text-urban-muted mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white">Produtos</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
            TODOS OS PRODUTOS
          </h1>
          <p className="text-sm text-urban-muted mt-2">
            Coleção completa de streetwear — encontre seu próximo look.
          </p>
        </div>
      </div>

      <div className="container-x py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <FiltersSidebar
                filters={filters}
                onChange={onChange}
                onClear={clearAll}
                totalActive={totalActive}
              />
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <SortBar
              total={filtered.length}
              sort={sort}
              onSort={(v) => updateParam('ordem', v === 'relevance' ? '' : v)}
              cols={cols}
              onCols={setCols}
              onOpenFilters={() => setFiltersOpen(true)}
            />

            <FilterChips filters={filters} onChange={onChange} onClear={clearAll} />

            {error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : loading ? (
              <LoadingState />
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mt-6 ${
                    cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {visibleItems.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 text-center">
                    <p className="text-xs text-urban-muted mb-3">
                      Mostrando {visibleItems.length} de {filtered.length} produtos
                    </p>
                    <button
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 bg-white text-urban-bg font-semibold text-sm tracking-widest px-8 py-3.5 hover:bg-urban-red hover:text-white transition-colors"
                    >
                      CARREGAR MAIS
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <TrustBar />

      {/* Mobile filters drawer */}
      <MobileFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={onChange}
        onClear={clearAll}
        totalActive={totalActive}
        total={filtered.length}
      />
    </>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-urban-card rounded-md" />
          <div className="mt-3.5 h-3 w-3/4 bg-urban-card rounded" />
          <div className="mt-2 h-3 w-1/3 bg-urban-card rounded" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="py-20 text-center">
      <div className="inline-grid place-items-center w-16 h-16 rounded-full bg-urban-red/10 border border-urban-red/40 mb-4">
        <AlertTriangle size={28} className="text-urban-red" />
      </div>
      <h3 className="text-xl font-semibold mb-1">Falha ao carregar produtos</h3>
      <p className="text-sm text-urban-muted mb-6 max-w-md mx-auto">
        {message}. Verifique se o backend está rodando em <code>localhost:3001</code>.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-urban-red hover:bg-urban-red-hover text-white font-semibold text-sm tracking-widest px-6 py-3 transition-colors"
      >
        <Loader2 size={14} /> TENTAR NOVAMENTE
      </button>
    </div>
  )
}

function EmptyState({ onClear }) {
  return (
    <div className="py-20 text-center">
      <div className="inline-grid place-items-center w-16 h-16 rounded-full bg-urban-card border border-urban-border mb-4">
        <PackageX size={28} className="text-urban-muted" />
      </div>
      <h3 className="text-xl font-semibold mb-1">Nenhum produto encontrado</h3>
      <p className="text-sm text-urban-muted mb-6">
        Tente ajustar os filtros para ver mais resultados.
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 bg-urban-red hover:bg-urban-red-hover text-white font-semibold text-sm tracking-widest px-6 py-3 transition-colors"
      >
        LIMPAR FILTROS
      </button>
    </div>
  )
}

function MobileFiltersDrawer({ open, onClose, total, ...rest }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div
        className={`absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-urban-bg border-l border-urban-border flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-urban-border">
          <h3 className="text-sm font-bold tracking-widest">FILTROS</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <FiltersSidebar {...rest} />
        </div>
        <div className="p-5 border-t border-urban-border">
          <button
            onClick={onClose}
            className="w-full bg-urban-red hover:bg-urban-red-hover text-white font-semibold text-sm tracking-widest py-3.5 transition-colors"
          >
            VER {total} {total === 1 ? 'PRODUTO' : 'PRODUTOS'}
          </button>
        </div>
      </div>
    </div>
  )
}
