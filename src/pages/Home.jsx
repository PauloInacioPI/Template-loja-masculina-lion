import { useMemo } from 'react'
import Hero from '../components/Hero'
import ProductShowcase from '../components/ProductShowcase'
import BannerDuo from '../components/BannerDuo'
import EditorialBanner from '../components/EditorialBanner'
import Instagram from '../components/Instagram'
import TrustBar from '../components/TrustBar'
import { useProducts } from '../hooks/useProducts'

export default function Home() {
  const { products, loading, error } = useProducts()

  // Vitrines derivadas dos produtos do backend
  const novidades = useMemo(
    () => products.filter((p) => p.isNew).slice(0, 4),
    [products]
  )
  const maisVendidos = useMemo(
    () => [...products]
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 4),
    [products]
  )
  const promocoes = useMemo(
    () => products.filter((p) => p.isSale).slice(0, 4),
    [products]
  )

  return (
    <>
      <Hero />

      {error && <ApiErrorBanner message={error} />}

      <ProductShowcase
        id="novidades"
        eyebrow="ACABOU DE CHEGAR"
        title="NOVIDADES"
        products={novidades}
        loading={loading}
        viewAllHref="/produtos?novos=1"
      />

      <BannerDuo />

      <ProductShowcase
        eyebrow="OS QUERIDINHOS"
        title="MAIS VENDIDOS"
        products={maisVendidos}
        loading={loading}
        viewAllHref="/produtos?ordem=best"
      />

      <EditorialBanner />

      <ProductShowcase
        id="promocoes"
        eyebrow="ATÉ 50% OFF"
        title="PROMOÇÕES"
        products={promocoes}
        loading={loading}
        viewAllHref="/produtos?promocao=1"
      />

      <Instagram />
      <TrustBar />
    </>
  )
}

function ApiErrorBanner({ message }) {
  return (
    <div className="container-x py-6">
      <div className="border border-urban-red/40 bg-urban-red/10 text-sm rounded p-4">
        <strong className="text-urban-red">API offline:</strong>{' '}
        <span className="text-white/80">{message}.</span>{' '}
        <span className="text-urban-muted">
          Verifique se o backend está rodando em <code>localhost:3001</code>.
        </span>
      </div>
    </div>
  )
}
