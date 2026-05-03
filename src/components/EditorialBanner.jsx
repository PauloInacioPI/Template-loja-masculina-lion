import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function EditorialBanner() {
  const { config } = useSiteConfig()
  const e = config.editorialBanner
  if (!e) return null
  return (
    <section id="lookbook" className="relative h-[480px] sm:h-[560px] lg:h-[640px] my-8 overflow-hidden">
      <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="relative h-full container-x flex items-center">
        <div className="max-w-lg">
          {e.eyebrow && <div className="text-[11px] font-semibold tracking-[0.25em] text-urban-red mb-4">{e.eyebrow}</div>}
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] whitespace-pre-line">{e.title}</h2>
          {e.subtitle && <p className="mt-5 text-base text-white/85 max-w-md">{e.subtitle}</p>}
          {e.cta && (
            <Link to={e.href || '/produtos'} className="mt-7 inline-flex items-center gap-2.5 bg-white text-urban-bg font-semibold text-sm tracking-widest px-7 py-4 hover:bg-urban-red hover:text-white transition-colors group">
              {e.cta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
