import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { TYPES, GENDERS, COLORS, SIZES, BRANDS } from '../data/products'

export default function FiltersSidebar({ filters, onChange, onClear, totalActive }) {
  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold tracking-widest">FILTROS</h3>
        {totalActive > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-semibold text-urban-red hover:underline"
          >
            LIMPAR TUDO
          </button>
        )}
      </div>

      <Group title="Categoria" defaultOpen>
        <div className="space-y-2">
          {TYPES.map((t) => (
            <CheckboxItem
              key={t.id}
              label={t.name}
              checked={filters.tipo.includes(t.id)}
              onChange={() => onChange.toggle('tipo', t.id)}
            />
          ))}
        </div>
      </Group>

      <Group title="Gênero" defaultOpen>
        <div className="space-y-2">
          {GENDERS.map((g) => (
            <CheckboxItem
              key={g.id}
              label={g.name}
              checked={filters.genero.includes(g.id)}
              onChange={() => onChange.toggle('genero', g.id)}
            />
          ))}
        </div>
      </Group>

      <Group title="Tamanho" defaultOpen>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((s) => {
            const active = filters.tamanho.includes(s)
            return (
              <button
                key={s}
                onClick={() => onChange.toggle('tamanho', s)}
                className={`h-9 text-xs font-semibold border rounded-sm transition-colors ${
                  active
                    ? 'bg-white text-urban-bg border-white'
                    : 'border-urban-border text-white/80 hover:border-white'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Cor" defaultOpen>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const active = filters.cor.includes(c.id)
            return (
              <button
                key={c.id}
                onClick={() => onChange.toggle('cor', c.id)}
                title={c.name}
                aria-label={c.name}
                className={`relative w-7 h-7 rounded-full border transition-all ${
                  active
                    ? 'border-white ring-2 ring-urban-red ring-offset-2 ring-offset-urban-bg'
                    : 'border-urban-border hover:border-white'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    size={12}
                    className={`absolute inset-0 m-auto ${
                      c.id === 'white' || c.id === 'beige' ? 'text-urban-bg' : 'text-white'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Preço">
        <div className="flex items-center gap-2">
          <PriceInput
            value={filters.precoMin}
            onChange={(v) => onChange.set('precoMin', v)}
            placeholder="Min"
          />
          <span className="text-urban-muted text-xs">—</span>
          <PriceInput
            value={filters.precoMax}
            onChange={(v) => onChange.set('precoMax', v)}
            placeholder="Max"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: 'Até R$ 100', max: 100 },
            { label: 'R$ 100—200', min: 100, max: 200 },
            { label: 'R$ 200—400', min: 200, max: 400 },
            { label: 'R$ 400+', min: 400 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => {
                onChange.set('precoMin', r.min ?? '')
                onChange.set('precoMax', r.max ?? '')
              }}
              className="text-[11px] px-2.5 py-1 border border-urban-border rounded-sm text-urban-muted hover:text-white hover:border-white transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Marca">
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <CheckboxItem
              key={b}
              label={b}
              checked={filters.marca.includes(b)}
              onChange={() => onChange.toggle('marca', b)}
            />
          ))}
        </div>
      </Group>

      <Group title="Outros">
        <div className="space-y-2">
          <CheckboxItem
            label="Em promoção"
            checked={filters.promocao}
            onChange={() => onChange.set('promocao', !filters.promocao)}
          />
          <CheckboxItem
            label="Lançamentos"
            checked={filters.novos}
            onChange={() => onChange.set('novos', !filters.novos)}
          />
        </div>
      </Group>
    </aside>
  )
}

function Group({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-urban-border py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-bold tracking-widest text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`text-urban-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <span
        className={`w-4 h-4 grid place-items-center border rounded-sm transition-colors ${
          checked
            ? 'bg-urban-red border-urban-red'
            : 'border-urban-border group-hover:border-white'
        }`}
      >
        {checked && <Check size={11} className="text-white" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm text-white/85 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  )
}

function PriceInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-urban-muted">R$</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-urban-card border border-urban-border rounded-sm pl-9 pr-2 h-9 text-sm focus:outline-none focus:border-urban-red transition-colors"
      />
    </div>
  )
}
