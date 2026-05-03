import { useState } from 'react'
import { Heart, Star, Eye } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false)
  const { openQuickView } = useStore()

  const installmentValue = product.installments
    ? (product.price / product.installments).toFixed(2).replace('.', ',')
    : null

  const open = () => openQuickView(product)
  const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }

  return (
    <article className="group relative">
      {/* Image (clickable) */}
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={onKey}
        className="relative aspect-[3/4] overflow-hidden bg-urban-card rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-urban-red focus:ring-offset-2 focus:ring-offset-urban-bg"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="bg-white text-urban-bg text-[10px] font-bold px-2 py-1 tracking-wider">
              {product.badge}
            </span>
          )}
          {product.discount && (
            <span className="bg-urban-red text-white text-[10px] font-bold px-2 py-1 tracking-wider">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v) }}
          aria-label="Favoritar"
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-white/95 hover:bg-white text-urban-bg shadow-sm transition"
        >
          <Heart
            size={15}
            className={`transition-all ${liked ? 'fill-urban-red text-urban-red scale-110' : ''}`}
          />
        </button>

        {/* Quick view button (hover) */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); open() }}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur text-urban-bg py-2.5 text-[11px] font-semibold tracking-widest hover:bg-urban-bg hover:text-white transition-colors"
          >
            <Eye size={14} />
            VISUALIZAÇÃO RÁPIDA
          </button>
        </div>
      </div>

      {/* Info (clickable) */}
      <div
        onClick={open}
        className="mt-3.5 cursor-pointer"
      >
        <h3 className="text-sm text-white font-medium line-clamp-1 uppercase tracking-wide group-hover:text-urban-red transition-colors">
          {product.name}
        </h3>

        {product.rating && (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={11}
                  className={
                    n <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-urban-border'
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-urban-muted">({product.reviews})</span>
          </div>
        )}

        <div className="mt-1.5 flex items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-xs text-urban-muted line-through">
              R$ {product.oldPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-base font-bold text-white">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {installmentValue && (
          <div className="text-[11px] text-urban-muted mt-0.5">
            ou {product.installments}x de R$ {installmentValue} sem juros
          </div>
        )}

        {product.swatches?.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {product.swatches.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-urban-border"
                style={{ backgroundColor: c }}
              />
            ))}
            {product.swatches.length > 4 && (
              <span className="text-[10px] text-urban-muted ml-1">
                +{product.swatches.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
