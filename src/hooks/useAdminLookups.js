// Hook único que carrega TODOS os lookups (cores, tamanhos, categorias, marcas)
// Reutilizável em forms admin (produto, variante, etc.)
import { useEffect, useState } from 'react'
import { fetchAdminColors, fetchAdminSizes, fetchAdminCategories, fetchAdminBrands } from '../lib/api'

export function useAdminLookups() {
  const [data, setData] = useState({ colors: [], sizes: [], categories: [], brands: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAdminColors(), fetchAdminSizes(), fetchAdminCategories(), fetchAdminBrands()])
      .then(([colors, sizes, categories, brands]) => {
        if (!cancelled) setData({ colors, sizes, categories, brands })
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { ...data, loading }
}
