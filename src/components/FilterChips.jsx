import { X } from 'lucide-react'
import { TYPES, GENDERS, COLORS } from '../data/products'

const labelOf = {
  tipo:   (id) => TYPES.find((t) => t.id === id)?.name ?? id,
  genero: (id) => GENDERS.find((g) => g.id === id)?.name ?? id,
  cor:    (id) => COLORS.find((c) => c.id === id)?.name ?? id,
  tamanho:(id) => `Tam. ${id}`,
  marca:  (id) => id,
}

export default function FilterChips({ filters, onChange, onClear }) {
  const chips = []

  ;['tipo', 'genero', 'cor', 'tamanho', 'marca'].forEach((k) => {
    filters[k]?.forEach((v) => {
      chips.push({ key: k, value: v, label: labelOf[k](v) })
    })
  })

  if (filters.precoMin || filters.precoMax) {
    chips.push({
      key: 'preco',
      value: 'preco',
      label: `R$ ${filters.precoMin || 0} — R$ ${filters.precoMax || '∞'}`,
    })
  }

  if (filters.promocao) chips.push({ key: 'promocao', value: 'promocao', label: 'Em promoção' })
  if (filters.novos)    chips.push({ key: 'novos',    value: 'novos',    label: 'Lançamentos' })

  if (chips.length === 0) return null

  return (
    <div className="flex items-center flex-wrap gap-2 py-3">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          onClick={() => {
            if (chip.key === 'preco')    { onChange.set('precoMin', ''); onChange.set('precoMax', '') }
            else if (chip.key === 'promocao') onChange.set('promocao', false)
            else if (chip.key === 'novos')    onChange.set('novos', false)
            else onChange.toggle(chip.key, chip.value)
          }}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 h-7 bg-urban-card border border-urban-border rounded-full text-xs hover:border-urban-red hover:text-urban-red transition-colors group"
        >
          <span>{chip.label}</span>
          <X size={12} className="opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      <button
        onClick={onClear}
        className="text-[11px] font-semibold text-urban-red hover:underline ml-1"
      >
        Limpar
      </button>
    </div>
  )
}
