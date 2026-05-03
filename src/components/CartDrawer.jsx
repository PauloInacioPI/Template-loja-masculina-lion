import { useEffect } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import { useStore, formatBRL } from '../context/StoreContext'
import { useSiteConfig } from '../context/SiteConfigContext'
import { COLORS } from '../data/products'

export default function CartDrawer() {
  const { cartOpen, closeCart, cart, count, subtotal, updateQty, removeItem, openCheckout } = useStore()
  const { config } = useSiteConfig()
  const FREE_SHIPPING_AT = Number(config.general?.freeShippingAt ?? 299)

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)

  return (
    <div
      className={`fixed inset-0 z-[55] transition-opacity duration-300 ${
        cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div onClick={closeCart} className="absolute inset-0 bg-black/70" />

      <aside
        className={`absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-urban-bg border-l border-urban-border flex flex-col transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-urban-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h3 className="text-sm font-bold tracking-widest">SACOLA</h3>
            <span className="text-xs text-urban-muted">({count})</span>
          </div>
          <button onClick={closeCart} aria-label="Fechar" className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping bar */}
        {cart.length > 0 && (
          <div className="px-5 py-3 border-b border-urban-border bg-urban-card/40">
            {remaining > 0 ? (
              <p className="text-xs text-white/85">
                Falta <strong className="text-urban-red">{formatBRL(remaining)}</strong> para você ganhar <strong>FRETE GRÁTIS</strong>
              </p>
            ) : (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} /> Você ganhou frete grátis!
              </p>
            )}
            <div className="mt-2 h-1.5 rounded-full bg-urban-border overflow-hidden">
              <div
                className="h-full bg-urban-red transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <ul className="divide-y divide-urban-border">
              {cart.map((line) => (
                <CartLine
                  key={line.key}
                  line={line}
                  onQty={(q) => updateQty(line.key, q)}
                  onRemove={() => removeItem(line.key)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-urban-border p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-urban-muted">Subtotal</span>
              <span className="text-xl font-bold">{formatBRL(subtotal)}</span>
            </div>
            <p className="text-[11px] text-urban-muted">
              Frete e impostos calculados na finalização.
            </p>
            <button
              onClick={openCheckout}
              className="w-full inline-flex items-center justify-center gap-2 bg-urban-red hover:bg-urban-red-hover text-white font-semibold text-sm tracking-widest h-12 transition-colors"
            >
              FINALIZAR COMPRA
              <ArrowRight size={16} />
            </button>
            <button
              onClick={closeCart}
              className="w-full text-xs text-urban-muted hover:text-white tracking-widest font-semibold transition-colors"
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function CartLine({ line, onQty, onRemove }) {
  const colorName = COLORS.find((c) => c.id === line.color)?.name
  return (
    <li className="flex gap-3 p-4">
      <div className="w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-urban-card rounded-sm overflow-hidden">
        <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium uppercase tracking-wide line-clamp-2">{line.name}</h4>
          <button
            onClick={onRemove}
            aria-label="Remover"
            className="text-urban-muted hover:text-urban-red transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
        <div className="text-[11px] text-urban-muted mt-1">
          {colorName && <>Cor: {colorName} · </>}
          {line.size && <>Tam: {line.size}</>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center border border-urban-border rounded-sm">
            <button onClick={() => onQty(line.qty - 1)} disabled={line.qty <= 1} className="w-7 h-8 grid place-items-center hover:text-white text-urban-muted disabled:opacity-30">
              <Minus size={12} />
            </button>
            <span className="w-7 text-center text-xs font-semibold">{line.qty}</span>
            <button onClick={() => onQty(line.qty + 1)} disabled={line.qty >= 20} className="w-7 h-8 grid place-items-center hover:text-white text-urban-muted disabled:opacity-30">
              <Plus size={12} />
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">{formatBRL(line.price * line.qty)}</div>
            {line.qty > 1 && (
              <div className="text-[10px] text-urban-muted">{line.qty} × {formatBRL(line.price)}</div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

function EmptyCart({ onClose }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 grid place-items-center rounded-full bg-urban-card border border-urban-border mb-4">
        <ShoppingBag size={26} className="text-urban-muted" />
      </div>
      <h4 className="text-lg font-semibold mb-1">Sua sacola está vazia</h4>
      <p className="text-sm text-urban-muted mb-6">
        Adicione produtos e dê um up no seu visual.
      </p>
      <button
        onClick={onClose}
        className="bg-white text-urban-bg font-semibold text-sm tracking-widest px-6 py-3 hover:bg-urban-red hover:text-white transition-colors"
      >
        EXPLORAR PRODUTOS
      </button>
    </div>
  )
}
