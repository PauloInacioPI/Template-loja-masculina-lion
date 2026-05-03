// =====================================================================
//  useAdminProducts — hook que busca produtos no endpoint admin.
//
//  Diferença pra useProducts (público):
//   - Inclui produtos inativos
//   - Cada produto tem `stock` (total) e `isActive` reais
//
//  Retorna { products, loading, error, refetch }.
// =====================================================================

import { useEffect, useState, useCallback } from 'react'
import { fetchAdminProducts } from '../lib/api'

export function useAdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAdminProducts()
      .then((data) => { if (!cancelled) setProducts(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { products, loading, error, refetch, setProducts }
}
