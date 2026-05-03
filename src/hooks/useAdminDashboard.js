import { useEffect, useState } from 'react'
import { fetchAdminStats, fetchAdminSalesChart, fetchAdminTopProducts, fetchAdminOrders } from '../lib/api'

export function useAdminDashboard() {
  const [data, setData] = useState({
    stats: null,
    salesChart: [],
    topProducts: [],
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchAdminStats(),
      fetchAdminSalesChart(),
      fetchAdminTopProducts(),
      fetchAdminOrders(),
    ])
      .then(([stats, salesChart, topProducts, allOrders]) => {
        if (cancelled) return
        setData({
          stats,
          salesChart,
          topProducts,
          recentOrders: allOrders.slice(0, 5),
        })
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { ...data, loading, error }
}
