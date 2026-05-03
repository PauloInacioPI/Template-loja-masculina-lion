import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

export default function ProductShowcase({
  id,
  eyebrow,
  title,
  products,
  loading = false,
  viewAllHref = '/produtos',
}) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <div className="container-x">
        <div className="flex items-end justify-between mb-7 sm:mb-9 gap-4">
          <div>
            {eyebrow && (
              <div className="text-[11px] font-semibold tracking-[0.22em] text-urban-red mb-2">
                {eyebrow}
              </div>
            )}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            to={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-white/80 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
          >
            VER TODOS
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="sm:hidden mt-8 flex justify-center">
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-white/80 border-b border-white/30 pb-1"
          >
            VER TODOS <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-urban-card rounded-md" />
      <div className="mt-3.5 h-3 w-3/4 bg-urban-card rounded" />
      <div className="mt-2 h-3 w-1/3 bg-urban-card rounded" />
    </div>
  )
}
