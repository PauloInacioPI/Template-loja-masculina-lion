import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/SiteConfigContext'
import { imageUrl } from '../lib/api'

export default function Logo() {
  const { config } = useSiteConfig()
  const g = config.general || {}
  const logo = g.logoUrl || '/lion-logo-white.png'    // fallback
  const name = g.storeName || 'LION'
  const short = name.split(' ')[0]                     // 1ª palavra (cabe no header)

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <img
        src={imageUrl(logo)}
        alt={name}
        className="w-11 h-11 object-contain transition-transform group-hover:scale-105"
      />
      <span className="font-display text-xl tracking-[0.2em] text-white">{short}</span>
    </Link>
  )
}
