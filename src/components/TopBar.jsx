import { useState, useEffect } from 'react'
import { Truck, X } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function TopBar() {
  const { config } = useSiteConfig()
  const messages = config.topBar?.length ? config.topBar : [{ text: '' }]
  const [idx, setIdx] = useState(0)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (messages.length < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages.length])

  if (closed) return null
  const m = messages[idx] || messages[0]
  if (!m?.text) return null

  return (
    <div className="bg-urban-red text-white text-xs">
      <div className="container-x flex items-center justify-center h-9 relative">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          {m.icon === 'Truck' && <Truck size={13} />}
          <span>{m.text}</span>
        </div>
        <button aria-label="Fechar" onClick={() => setClosed(true)} className="absolute right-2 sm:right-4 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
