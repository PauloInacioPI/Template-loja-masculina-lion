import { Truck, RotateCcw, ShieldCheck, CreditCard, Star, Award, Heart } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

const ICONS = { Truck, RotateCcw, ShieldCheck, CreditCard, Star, Award, Heart }

export default function TrustBar() {
  const { config } = useSiteConfig()
  const items = config.trustBar || []
  if (items.length === 0) return null

  return (
    <section className="border-y border-urban-border bg-urban-card/40 py-10 sm:py-12">
      <div className="container-x grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {items.map((it, i) => {
          const Icon = ICONS[it.icon] || Truck
          return (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 grid place-items-center rounded-full border border-urban-border text-urban-red flex-shrink-0">
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-widest">{it.title}</div>
                <div className="text-xs text-urban-muted mt-0.5">{it.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
