// Páginas placeholder — relatórios e configurações.
// Você pode substituir cada uma quando for implementar.

import { Wrench } from 'lucide-react'

export default function Placeholder({ title, subtitle = 'Em construção.' }) {
  return (
    <div className="py-20 text-center">
      <div className="inline-grid place-items-center w-16 h-16 rounded-full bg-urban-card border border-urban-border mb-4">
        <Wrench size={26} className="text-urban-muted" />
      </div>
      <h1 className="font-display text-3xl mb-1">{title}</h1>
      <p className="text-sm text-urban-muted max-w-md mx-auto">{subtitle}</p>
    </div>
  )
}
