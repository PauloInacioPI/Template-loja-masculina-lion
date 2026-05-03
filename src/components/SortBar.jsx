import { useState, useRef, useEffect } from 'react'
import { ChevronDown, SlidersHorizontal, Grid2X2, Grid3X3, Check } from 'lucide-react'

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Mais relevantes' },
  { id: 'best',      label: 'Mais vendidos' },
  { id: 'newest',    label: 'Lançamentos' },
  { id: 'price-asc', label: 'Menor preço' },
  { id: 'price-desc',label: 'Maior preço' },
  { id: 'discount',  label: 'Maior desconto' },
]

export default function SortBar({
  total,
  sort,
  onSort,
  cols,
  onCols,
  onOpenFilters,
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4 border-y border-urban-border">
      <div className="flex items-center gap-3">
        {/* Mobile filters trigger */}
        <button
          onClick={onOpenFilters}
          className="lg:hidden inline-flex items-center gap-2 px-3 h-9 border border-urban-border rounded-sm text-xs font-semibold tracking-widest hover:border-white transition-colors"
        >
          <SlidersHorizontal size={14} />
          FILTROS
        </button>
        <span className="text-xs text-urban-muted">
          <strong className="text-white">{total}</strong> {total === 1 ? 'produto' : 'produtos'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Cols toggle (desktop) */}
        <div className="hidden md:flex items-center gap-0.5 mr-1">
          <ColsBtn active={cols === 3} onClick={() => onCols(3)} aria-label="3 colunas">
            <Grid2X2 size={15} />
          </ColsBtn>
          <ColsBtn active={cols === 4} onClick={() => onCols(4)} aria-label="4 colunas">
            <Grid3X3 size={15} />
          </ColsBtn>
        </div>

        <SortDropdown sort={sort} onSort={onSort} />
      </div>
    </div>
  )
}

function ColsBtn({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`w-9 h-9 grid place-items-center rounded-sm transition-colors ${
        active ? 'bg-white text-urban-bg' : 'text-urban-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function SortDropdown({ sort, onSort }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = SORT_OPTIONS.find((o) => o.id === sort) ?? SORT_OPTIONS[0]

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 h-9 border border-urban-border rounded-sm text-xs font-semibold tracking-widest hover:border-white transition-colors"
      >
        ORDENAR: <span className="text-urban-muted normal-case font-normal tracking-normal">{current.label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-urban-card border border-urban-border rounded-sm shadow-2xl z-30 py-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onSort(opt.id)
                setOpen(false)
              }}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-sm text-white/90 hover:bg-white/5 transition-colors"
            >
              <span>{opt.label}</span>
              {opt.id === sort && <Check size={14} className="text-urban-red" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
