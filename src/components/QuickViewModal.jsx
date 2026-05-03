import { useEffect, useState } from 'react'
import { X, Heart, Star, Minus, Plus, ShoppingBag, Check } from 'lucide-react'
import { useStore, formatBRL } from '../context/StoreContext'
import { COLORS } from '../data/products'

export default function QuickViewModal() {
  const { quickView: product, closeQuickView, addToCart } = useStore()
  return product ? <Modal product={product} onClose={closeQuickView} onAdd={addToCart} /> : null
}

function Modal({ product, onClose, onAdd }) {
  const colors = product.colors || []
  const sizes  = product.sizes  || []

  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null)
  const [color, setColor] = useState(colors[0] || null)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(product.image)
  const [liked, setLiked] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const gallery = [product.image, product.hoverImage].filter(Boolean)
  const colorObj = (id) => COLORS.find((c) => c.id === id)
  const installmentValue = product.installments
    ? formatBRL(product.price / product.installments)
    : null

  const handleAdd = () => {
    if (!size) { setError('Selecione um tamanho'); return }
    if (!color) { setError('Selecione uma cor'); return }
    setError('')
    onAdd(product, { size, color, qty })
    setAdded(true)
    setTimeout(() => onClose(), 600)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-5xl sm:mx-4 max-h-[95vh] sm:max-h-[88vh] bg-urban-bg sm:rounded-lg border border-urban-border flex flex-col overflow-hidden animate-fade-up">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-urban-card/90 backdrop-blur border border-urban-border text-white/80 hover:text-white hover:border-white"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2 overflow-y-auto">
          {/* Gallery */}
          <div className="relative bg-urban-card">
            <div className="relative aspect-[3/4] sm:aspect-auto sm:h-full overflow-hidden">
              <img src={activeImg} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              {product.discount && (
                <span className="absolute top-3 left-3 bg-urban-red text-white text-[10px] font-bold px-2 py-1 tracking-wider">
                  -{product.discount}%
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(src)}
                    className={`w-14 h-14 rounded-sm overflow-hidden border-2 transition ${
                      activeImg === src ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-urban-red mb-2">
              {product.brand}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight uppercase">
              {product.name}
            </h2>

            {product.rating && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={13}
                      className={n <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-urban-border'}
                    />
                  ))}
                </div>
                <span className="text-xs text-urban-muted">
                  {product.rating} · {product.reviews} avaliações
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-5">
              <div className="flex items-baseline gap-3">
                {product.oldPrice && (
                  <span className="text-sm text-urban-muted line-through">
                    {formatBRL(product.oldPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold">{formatBRL(product.price)}</span>
              </div>
              {installmentValue && (
                <div className="text-xs text-urban-muted mt-1">
                  ou {product.installments}x de {installmentValue} sem juros · 10% OFF no PIX
                </div>
              )}
            </div>

            <p className="mt-5 text-sm text-white/75 leading-relaxed">
              {product.description}
            </p>

            {/* Color */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold tracking-widest">
                  COR{color ? `: ${colorObj(color)?.name}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((id) => {
                  const c = colorObj(id)
                  const active = color === id
                  return (
                    <button
                      key={id}
                      onClick={() => setColor(id)}
                      title={c?.name}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        active ? 'border-white ring-2 ring-urban-red ring-offset-2 ring-offset-urban-bg' : 'border-urban-border hover:border-white'
                      }`}
                      style={{ backgroundColor: c?.hex }}
                    >
                      {active && (
                        <Check
                          size={14}
                          className={`absolute inset-0 m-auto ${
                            id === 'white' || id === 'beige' ? 'text-urban-bg' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Size */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold tracking-widest">
                  TAMANHO{size ? `: ${size}` : ''}
                </span>
                <button className="text-[11px] text-urban-muted underline hover:text-white">
                  Tabela de medidas
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {sizes.map((s) => {
                  const active = size === s
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-11 text-sm font-semibold border rounded-sm transition-colors ${
                        active
                          ? 'bg-white text-urban-bg border-white'
                          : 'border-urban-border text-white/85 hover:border-white'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Qty + actions */}
            <div className="mt-6 flex items-stretch gap-3">
              <div className="flex items-center border border-urban-border rounded-sm">
                <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={14} /></QtyBtn>
                <div className="w-12 text-center text-sm font-semibold">{qty}</div>
                <QtyBtn onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= 20}><Plus size={14} /></QtyBtn>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold text-sm tracking-widest transition-colors h-11 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-urban-red hover:bg-urban-red-hover text-white'
                }`}
              >
                {added ? (<><Check size={16} /> ADICIONADO</>) : (<><ShoppingBag size={16} /> ADICIONAR À SACOLA</>)}
              </button>
              <button
                onClick={() => setLiked((v) => !v)}
                aria-label="Favoritar"
                className="w-11 h-11 grid place-items-center border border-urban-border hover:border-urban-red transition-colors"
              >
                <Heart size={16} className={liked ? 'fill-urban-red text-urban-red' : ''} />
              </button>
            </div>

            {error && (
              <div className="mt-3 text-xs text-urban-red font-semibold">{error}</div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function QtyBtn({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="w-10 h-11 grid place-items-center text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

