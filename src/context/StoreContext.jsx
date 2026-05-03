import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const StoreCtx = createContext(null)

const STORAGE_KEY = 'urban.cart.v1'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCart(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

function lineKey(productId, size, color) {
  return `${productId}::${size || '-'}::${color || '-'}`
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, size, color, qty } = action
      const key = lineKey(product.id, size, color)
      const existing = state.find((l) => l.key === key)
      if (existing) {
        return state.map((l) =>
          l.key === key ? { ...l, qty: Math.min(l.qty + qty, 20) } : l
        )
      }
      return [
        ...state,
        {
          key,
          productId: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          size,
          color,
          qty,
        },
      ]
    }
    case 'UPDATE_QTY': {
      return state.map((l) =>
        l.key === action.key ? { ...l, qty: Math.max(1, Math.min(20, action.qty)) } : l
      )
    }
    case 'REMOVE':  return state.filter((l) => l.key !== action.key)
    case 'CLEAR':   return []
    case 'HYDRATE': return action.items
    default: return state
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart)
  const [quickView, setQuickView] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => { saveCart(cart) }, [cart])

  // Auto-open cart drawer briefly when adding (UX feedback). Skip if checkout is already open.
  const addToCart = (product, opts) => {
    dispatch({ type: 'ADD', product, ...opts })
    if (!checkoutOpen) setCartOpen(true)
  }

  const updateQty   = (key, qty) => dispatch({ type: 'UPDATE_QTY', key, qty })
  const removeItem  = (key) => dispatch({ type: 'REMOVE', key })
  const clearCart   = () => dispatch({ type: 'CLEAR' })

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.qty, 0),
    [cart]
  )
  const count = useMemo(
    () => cart.reduce((sum, l) => sum + l.qty, 0),
    [cart]
  )

  const value = {
    cart, count, subtotal,
    addToCart, updateQty, removeItem, clearCart,
    quickView, openQuickView: setQuickView, closeQuickView: () => setQuickView(null),
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    checkoutOpen, openCheckout: () => { setCartOpen(false); setCheckoutOpen(true) }, closeCheckout: () => setCheckoutOpen(false),
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export const formatBRL = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
