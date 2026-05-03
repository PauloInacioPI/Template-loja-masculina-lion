// =====================================================================
//  SiteConfigContext — carrega config da loja (uma vez no boot) e
//  disponibiliza em todo o app (loja pública + admin).
//
//  Componentes consomem com:    const { config } = useSiteConfig()
//  Refresh após salvar:         const { reload } = useSiteConfig()
// =====================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchSiteConfig } from '../lib/api'

// Defaults usados durante o loading inicial (evita flash em branco)
const DEFAULTS = {
  general: {
    storeName: 'LION MODAS',
    storeEmail: 'contato@lionmodas.com.br',
    storePhone: '(11) 4002-8922',
    storeAddress: '',
    cnpj: '',
    whatsappNumber: '5511999999999',
    freeShippingAt: 299,
    flatShipping: 19.90,
    pixDiscountPercent: 10,
  },
  topBar: [],
  hero: [],
  bannerDuo: [],
  editorialBanner: null,
  trustBar: [],
  instagram: [],
  footer: { bio: '', social: {}, payments: [], seals: [] },
}

const Ctx = createContext({ config: DEFAULTS, loading: true, reload: () => {} })

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchSiteConfig()
      .then((data) => { if (!cancelled) setConfig({ ...DEFAULTS, ...data }) })
      .catch(() => {/* mantém defaults se backend offline */})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return <Ctx.Provider value={{ config, loading, reload }}>{children}</Ctx.Provider>
}

export function useSiteConfig() {
  return useContext(Ctx)
}
