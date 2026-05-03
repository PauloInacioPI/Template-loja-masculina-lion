import { Instagram as IGIcon } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function Instagram() {
  const { config } = useSiteConfig()
  const photos = config.instagram || []
  if (photos.length === 0) return null

  return (
    <section className="py-14 sm:py-16">
      <div className="container-x text-center mb-8">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-urban-red mb-2">
          <IGIcon size={14} /> @LIONMODAS.OFICIAL
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">MARQUE #LIONCREW</h2>
        <p className="mt-2 text-sm text-urban-muted">Compartilhe seu look com a gente — você pode aparecer aqui.</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-1.5">
        {photos.map((src, i) => (
          <a key={i} href="#" className="group relative aspect-square overflow-hidden">
            <img src={src} alt={`Post ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors grid place-items-center">
              <IGIcon size={22} className="opacity-0 group-hover:opacity-100 transition-opacity text-white" />
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
