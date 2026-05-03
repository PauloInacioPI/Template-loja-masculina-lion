// =====================================================================
//  /admin/configuracoes — todos os parâmetros editáveis da loja
//  Abas: Geral · Hero · Banner Duo · Editorial · Top Bar · Trust Bar · Instagram · Footer
// =====================================================================

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, X, Loader2, AlertTriangle, Image as ImageIcon, Settings as SettingsIcon, Layout, GalleryHorizontal, Sparkles, ShieldCheck, Instagram as IG, Layers } from 'lucide-react'
import { fetchAdminSettings, updateAdminSetting, imageUrl } from '../../lib/api'
import { useSiteConfig } from '../../context/SiteConfigContext'
import ImageUploader from '../../components/admin/ImageUploader'

const TABS = [
  { id: 'general',         label: 'Geral',      icon: SettingsIcon },
  { id: 'hero',            label: 'Hero',       icon: Layout },
  { id: 'bannerDuo',       label: 'Banners',    icon: GalleryHorizontal },
  { id: 'editorialBanner', label: 'Editorial',  icon: Sparkles },
  { id: 'topBar',          label: 'Top bar',    icon: Layers },
  { id: 'trustBar',        label: 'Trust bar',  icon: ShieldCheck },
  { id: 'instagram',       label: 'Instagram',  icon: IG },
  { id: 'footer',          label: 'Footer',     icon: SettingsIcon },
]

export default function AdminSettings() {
  const { reload: reloadGlobal } = useSiteConfig()
  const [tab, setTab] = useState('general')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const updateKey = (key, value) => setSettings((s) => ({ ...(s || {}), [key]: value }))

  const save = async (key) => {
    try {
      await updateAdminSetting(key, settings[key])
      reloadGlobal()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    } catch (e) { alert(e.message) }
  }

  if (loading) return <div className="text-center py-10 text-urban-muted"><Loader2 size={20} className="inline animate-spin mr-2" /> Carregando…</div>
  if (error)   return <div className="text-center py-10 text-urban-red"><AlertTriangle size={18} className="inline mr-2" /> {error}</div>
  if (!settings) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Configurações</h1>
        <p className="text-sm text-urban-muted mt-1">Tudo que aparece na loja pública é editável aqui.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-urban-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-3 h-10 text-xs font-semibold tracking-widest border-b-2 transition-colors ${
              tab === t.id ? 'border-urban-red text-white' : 'border-transparent text-urban-muted hover:text-white'
            }`}
          >
            <t.icon size={14} /> {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {savedFlash && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold animate-fade-up">✓ Salvo</div>
      )}

      <div className="bg-urban-card/40 border border-urban-border rounded-lg p-5 sm:p-6">
        {tab === 'general'         && <GeneralForm  data={settings.general}  onChange={(v) => updateKey('general', v)}  onSave={() => save('general')} />}
        {tab === 'hero'            && <HeroForm     data={settings.hero}     onChange={(v) => updateKey('hero', v)}     onSave={() => save('hero')} />}
        {tab === 'bannerDuo'       && <BannerDuoForm data={settings.bannerDuo} onChange={(v) => updateKey('bannerDuo', v)} onSave={() => save('bannerDuo')} />}
        {tab === 'editorialBanner' && <EditorialForm data={settings.editorialBanner} onChange={(v) => updateKey('editorialBanner', v)} onSave={() => save('editorialBanner')} />}
        {tab === 'topBar'          && <TopBarForm   data={settings.topBar}   onChange={(v) => updateKey('topBar', v)}   onSave={() => save('topBar')} />}
        {tab === 'trustBar'        && <TrustBarForm data={settings.trustBar} onChange={(v) => updateKey('trustBar', v)} onSave={() => save('trustBar')} />}
        {tab === 'instagram'       && <InstagramForm data={settings.instagram} onChange={(v) => updateKey('instagram', v)} onSave={() => save('instagram')} />}
        {tab === 'footer'          && <FooterForm   data={settings.footer}   onChange={(v) => updateKey('footer', v)}   onSave={() => save('footer')} />}
      </div>
    </div>
  )
}

// ====================================================================
//  Forms por seção
// ====================================================================

function GeneralForm({ data, onChange, onSave }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <Section title="Dados da loja & checkout" onSave={onSave}>
      <Field label="Logo da loja (aparece no header)">
        <ImageUploader value={data.logoUrl} onChange={(v) => set('logoUrl', v)} size="lg" />
      </Field>
      <Row>
        <Field label="Nome da loja"><input value={data.storeName ?? ''} onChange={(e) => set('storeName', e.target.value)} className={inputCls} /></Field>
        <Field label="CNPJ"><input value={data.cnpj ?? ''} onChange={(e) => set('cnpj', e.target.value)} className={inputCls} /></Field>
      </Row>
      <Row>
        <Field label="E-mail"><input type="email" value={data.storeEmail ?? ''} onChange={(e) => set('storeEmail', e.target.value)} className={inputCls} /></Field>
        <Field label="Telefone"><input value={data.storePhone ?? ''} onChange={(e) => set('storePhone', e.target.value)} className={inputCls} /></Field>
      </Row>
      <Field label="Endereço"><input value={data.storeAddress ?? ''} onChange={(e) => set('storeAddress', e.target.value)} className={inputCls} /></Field>
      <hr className="border-urban-border my-2" />
      <Row>
        <Field label="WhatsApp do checkout (com DDI 55)" hint="Ex: 5511999999999">
          <input value={data.whatsappNumber ?? ''} onChange={(e) => set('whatsappNumber', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Frete grátis acima de (R$)">
          <input type="number" step="0.01" min="0" value={data.freeShippingAt ?? 0} onChange={(e) => set('freeShippingAt', Number(e.target.value))} className={inputCls} />
        </Field>
      </Row>
      <Row>
        <Field label="Frete fixo (R$)">
          <input type="number" step="0.01" min="0" value={data.flatShipping ?? 0} onChange={(e) => set('flatShipping', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Desconto PIX (%)">
          <input type="number" step="0.1" min="0" max="100" value={data.pixDiscountPercent ?? 0} onChange={(e) => set('pixDiscountPercent', Number(e.target.value))} className={inputCls} />
        </Field>
      </Row>
    </Section>
  )
}

function HeroForm({ data, onChange, onSave }) {
  const slides = data || []
  const update = (i, slide) => onChange(slides.map((s, idx) => idx === i ? slide : s))
  const remove = (i) => onChange(slides.filter((_, idx) => idx !== i))
  const add = () => onChange([...slides, { eyebrow: '', title: 'NOVO SLIDE', subtitle: '', cta: 'COMPRAR', href: '/produtos', image: '', align: 'left' }])

  return (
    <Section title={`Slides do Hero (${slides.length})`} onSave={onSave} action={<Btn onClick={add}><Plus size={13} /> ADICIONAR</Btn>}>
      <div className="space-y-4">
        {slides.map((s, i) => (
          <Card key={i} title={`Slide ${i + 1}`} onRemove={() => remove(i)}>
            <Row>
              <Field label="Eyebrow"><input value={s.eyebrow ?? ''} onChange={(e) => update(i, { ...s, eyebrow: e.target.value })} className={inputCls} placeholder="ex: COLEÇÃO FW26" /></Field>
              <Field label="Título *"><input value={s.title ?? ''} onChange={(e) => update(i, { ...s, title: e.target.value })} className={inputCls} /></Field>
            </Row>
            <Field label="Subtítulo"><input value={s.subtitle ?? ''} onChange={(e) => update(i, { ...s, subtitle: e.target.value })} className={inputCls} /></Field>
            <Row>
              <Field label="Texto do botão"><input value={s.cta ?? ''} onChange={(e) => update(i, { ...s, cta: e.target.value })} className={inputCls} /></Field>
              <Field label="Link (href)"><input value={s.href ?? ''} onChange={(e) => update(i, { ...s, href: e.target.value })} className={inputCls} placeholder="/produtos?…" /></Field>
              <Field label="Alinhamento">
                <select value={s.align ?? 'left'} onChange={(e) => update(i, { ...s, align: e.target.value })} className={inputCls}>
                  <option value="left">Esquerda</option>
                  <option value="right">Direita</option>
                </select>
              </Field>
            </Row>
            <Field label="Imagem"><ImageUploader value={s.image} onChange={(v) => update(i, { ...s, image: v })} /></Field>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function BannerDuoForm({ data, onChange, onSave }) {
  const items = data || []
  const update = (i, item) => onChange(items.map((s, idx) => idx === i ? item : s))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { title: 'NOVO', subtitle: '', image: '', to: '/produtos' }])

  return (
    <Section title={`Banner Duplo (${items.length})`} onSave={onSave} action={<Btn onClick={add}><Plus size={13} /> ADICIONAR</Btn>}>
      <div className="space-y-4">
        {items.map((it, i) => (
          <Card key={i} title={`Banner ${i + 1}`} onRemove={() => remove(i)}>
            <Row>
              <Field label="Título *"><input value={it.title} onChange={(e) => update(i, { ...it, title: e.target.value })} className={inputCls} /></Field>
              <Field label="Subtítulo"><input value={it.subtitle ?? ''} onChange={(e) => update(i, { ...it, subtitle: e.target.value })} className={inputCls} /></Field>
              <Field label="Link"><input value={it.to ?? ''} onChange={(e) => update(i, { ...it, to: e.target.value })} className={inputCls} /></Field>
            </Row>
            <Field label="Imagem"><ImageUploader value={it.image} onChange={(v) => update(i, { ...it, image: v })} /></Field>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function EditorialForm({ data, onChange, onSave }) {
  const e = data || {}
  const set = (k, v) => onChange({ ...e, [k]: v })
  return (
    <Section title="Banner Editorial (lookbook)" onSave={onSave}>
      <Row>
        <Field label="Eyebrow"><input value={e.eyebrow ?? ''} onChange={(ev) => set('eyebrow', ev.target.value)} className={inputCls} /></Field>
        <Field label="Texto do botão"><input value={e.cta ?? ''} onChange={(ev) => set('cta', ev.target.value)} className={inputCls} /></Field>
      </Row>
      <Field label="Título (use \n para quebra de linha)"><textarea rows={2} value={e.title ?? ''} onChange={(ev) => set('title', ev.target.value)} className={inputCls + ' resize-none'} /></Field>
      <Field label="Subtítulo"><textarea rows={2} value={e.subtitle ?? ''} onChange={(ev) => set('subtitle', ev.target.value)} className={inputCls + ' resize-none'} /></Field>
      <Field label="Link"><input value={e.href ?? ''} onChange={(ev) => set('href', ev.target.value)} className={inputCls} /></Field>
      <Field label="Imagem"><ImageUploader value={e.image} onChange={(v) => set('image', v)} size="lg" /></Field>
    </Section>
  )
}

function TopBarForm({ data, onChange, onSave }) {
  const items = data || []
  const update = (i, item) => onChange(items.map((s, idx) => idx === i ? item : s))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { text: '' }])

  return (
    <Section title={`Mensagens da Top Bar (${items.length})`} onSave={onSave} action={<Btn onClick={add}><Plus size={13} /> ADICIONAR</Btn>}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <select value={it.icon ?? ''} onChange={(e) => update(i, { ...it, icon: e.target.value })} className={inputCls + ' max-w-[140px]'}>
              <option value="">Sem ícone</option>
              <option value="Truck">Caminhão</option>
            </select>
            <input value={it.text ?? ''} onChange={(e) => update(i, { ...it, text: e.target.value })} placeholder="Texto da mensagem" className={inputCls} />
            <button onClick={() => remove(i)} className="w-9 h-11 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-urban-muted mt-3">As mensagens vão alternar a cada 4 segundos.</p>
    </Section>
  )
}

function TrustBarForm({ data, onChange, onSave }) {
  const items = data || []
  const update = (i, item) => onChange(items.map((s, idx) => idx === i ? item : s))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { icon: 'Truck', title: '', sub: '' }])

  return (
    <Section title={`Trust Bar (${items.length})`} onSave={onSave} action={<Btn onClick={add}><Plus size={13} /> ADICIONAR</Btn>}>
      <div className="space-y-3">
        {items.map((it, i) => (
          <Card key={i} title={`Item ${i + 1}`} onRemove={() => remove(i)}>
            <Row>
              <Field label="Ícone">
                <select value={it.icon ?? 'Truck'} onChange={(e) => update(i, { ...it, icon: e.target.value })} className={inputCls}>
                  <option value="Truck">Caminhão</option>
                  <option value="RotateCcw">Troca</option>
                  <option value="ShieldCheck">Escudo</option>
                  <option value="CreditCard">Cartão</option>
                  <option value="Star">Estrela</option>
                  <option value="Award">Prêmio</option>
                  <option value="Heart">Coração</option>
                </select>
              </Field>
              <Field label="Título"><input value={it.title ?? ''} onChange={(e) => update(i, { ...it, title: e.target.value })} className={inputCls} /></Field>
              <Field label="Subtítulo"><input value={it.sub ?? ''} onChange={(e) => update(i, { ...it, sub: e.target.value })} className={inputCls} /></Field>
            </Row>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function InstagramForm({ data, onChange, onSave }) {
  const photos = data || []
  const update = (i, url) => onChange(photos.map((p, idx) => idx === i ? url : p))
  const remove = (i) => onChange(photos.filter((_, idx) => idx !== i))
  const add = () => onChange([...photos, ''])

  return (
    <Section title={`Galeria Instagram (${photos.length} fotos)`} onSave={onSave} action={<Btn onClick={add}><Plus size={13} /> ADICIONAR</Btn>}>
      <div className="space-y-3">
        {photos.map((src, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1"><ImageUploader value={src} onChange={(v) => update(i, v)} size="sm" /></div>
            <button onClick={() => remove(i)} className="w-9 h-11 grid place-items-center text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </Section>
  )
}

function FooterForm({ data, onChange, onSave }) {
  const f = data || { social: {}, payments: [], seals: [] }
  const set = (k, v) => onChange({ ...f, [k]: v })
  const setSocial = (k, v) => onChange({ ...f, social: { ...(f.social || {}), [k]: v } })

  return (
    <Section title="Footer" onSave={onSave}>
      <Field label="Bio"><textarea rows={2} value={f.bio ?? ''} onChange={(e) => set('bio', e.target.value)} className={inputCls + ' resize-none'} /></Field>
      <Row>
        <Field label="Instagram"><input value={f.social?.instagram ?? ''} onChange={(e) => setSocial('instagram', e.target.value)} className={inputCls} placeholder="https://instagram.com/…" /></Field>
        <Field label="Facebook"><input value={f.social?.facebook ?? ''} onChange={(e) => setSocial('facebook', e.target.value)} className={inputCls} /></Field>
      </Row>
      <Row>
        <Field label="Twitter"><input value={f.social?.twitter ?? ''} onChange={(e) => setSocial('twitter', e.target.value)} className={inputCls} /></Field>
        <Field label="YouTube"><input value={f.social?.youtube ?? ''} onChange={(e) => setSocial('youtube', e.target.value)} className={inputCls} /></Field>
      </Row>
      <Field label="Bandeiras de pagamento (separe por vírgula)">
        <input value={(f.payments || []).join(', ')} onChange={(e) => set('payments', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className={inputCls} />
      </Field>
      <Field label="Selos de segurança (separe por vírgula)">
        <input value={(f.seals || []).join(', ')} onChange={(e) => set('seals', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className={inputCls} />
      </Field>
    </Section>
  )
}

// ====================================================================
//  Helpers UI
// ====================================================================

function Section({ title, children, onSave, action }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl">{title}</h3>
        <div className="flex items-center gap-2">
          {action}
          <button onClick={onSave} className="inline-flex items-center gap-2 px-4 h-10 bg-urban-red hover:bg-urban-red-hover rounded-md text-xs font-semibold tracking-widest"><Save size={13} /> SALVAR</button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Card({ title, children, onRemove }) {
  return (
    <div className="border border-urban-border rounded-md p-4 bg-urban-bg/30">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest text-urban-muted">{title}</span>
        {onRemove && <button onClick={onRemove} className="text-urban-muted hover:text-urban-red"><Trash2 size={14} /></button>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children, hint, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-urban-muted block mt-1">{hint}</span>}
    </label>
  )
}

function Row({ children }) { return <div className="flex flex-col sm:flex-row gap-3 [&>*]:flex-1">{children}</div> }
function Btn({ children, ...rest }) {
  return <button {...rest} className="inline-flex items-center gap-1 px-3 h-9 border border-urban-border hover:border-white rounded-md text-xs font-semibold tracking-widest">{children}</button>
}

const inputCls = 'w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60'
