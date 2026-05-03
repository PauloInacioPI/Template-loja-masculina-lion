import { useEffect, useState, useCallback } from 'react'
import { fetchAdminCustomers } from '../lib/api'

export function useAdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchAdminCustomers()
      .then((d) => { if (!cancelled) setCustomers(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])
  return { customers, loading, error, refetch }
}
