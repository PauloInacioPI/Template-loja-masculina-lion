// =====================================================================
//  useProducts — hook que busca produtos do backend.
//
//  Retorna { products, loading, error, refetch }.
//
//  Conceito: um custom hook é uma função React que encapsula lógica de
//  estado + efeitos colaterais. Qualquer componente que chamar
//  useProducts() ganha automaticamente o gerenciamento de loading/erro
//  sem repetir código.
//
//  Detalhe importante: a flag `cancelled` evita "setState em componente
//  desmontado" (warning clássico do React) — se o usuário muda de página
//  antes do fetch terminar, ignoramos o resultado.
// =====================================================================

import { useEffect, useState, useCallback } from 'react'
import { fetchProducts } from '../lib/api'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchProducts()
      .then((data) => { if (!cancelled) setProducts(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { products, loading, error, refetch }
}
