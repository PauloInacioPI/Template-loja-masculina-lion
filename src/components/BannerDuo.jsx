import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function BannerDuo() {
  const { config } = useSiteConfig()
  const banners = config.bannerDuo || []
  if (banners.length === 0) return null

  return (
    <section className="py-2">
      <div className="container-x grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <Link key={b.title} to={b.to || '/produtos'} className="group relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden rounded-md">
            <img src={b.image} alt={b.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <h3 className="font-display text-4xl sm:text-5xl tracking-tight">{b.title}</h3>
              {b.subtitle && <p className="mt-1 text-sm text-white/85">{b.subtitle}</p>}
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-widest border-b border-white/40 group-hover:border-urban-red group-hover:text-urban-red pb-1 transition-colors">
                COMPRAR AGORA
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
