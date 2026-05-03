import { useState } from 'react'
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ChevronDown, Loader2, Check } from 'lucide-react'
import Logo from './Logo'
import { useSiteConfig } from '../context/SiteConfigContext'
import { subscribeNewsletter } from '../lib/api'

const SECTIONS = [
  { title: 'INSTITUCIONAL', links: ['Sobre a LION', 'Nossas lojas', 'Trabalhe conosco', 'Blog', 'Imprensa'] },
  { title: 'AJUDA',         links: ['Central de atendimento', 'Trocas e devoluções', 'Frete e prazo', 'Tabela de medidas', 'FAQ'] },
  { title: 'CATEGORIAS',    links: ['Novidades', 'Masculino', 'Feminino', 'Acessórios', 'Outlet'] },
]

export default function Footer() {
  const { config } = useSiteConfig()
  const f = config.footer || {}
  const g = config.general || {}
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || sending) return
    setSending(true)
    try {
      await subscribeNewsletter(email)
      setSent(true)
      setEmail('')
      setTimeout(() => setSent(false), 3000)
    } catch (err) { alert(err.message) }
    finally { setSending(false) }
  }

  return (
    <footer className="bg-black border-t border-urban-border">
      {/* Newsletter strip */}
      <div className="border-b border-urban-border">
        <div className="container-x py-10 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl tracking-tight">ENTRE NA LION CREW</h3>
            <p className="mt-1 text-sm text-urban-muted">
              Cadastre seu e-mail e ganhe <span className="text-white font-semibold">10% OFF</span> na primeira compra.
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-urban-muted" />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-urban-card border border-urban-border rounded-sm pl-11 pr-4 h-12 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red"
              />
            </div>
            <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-2 bg-urban-red hover:bg-urban-red-hover disabled:opacity-50 h-12 px-7 text-sm font-semibold tracking-widest">
              {sending ? <Loader2 size={14} className="animate-spin" /> : sent ? <><Check size={14} /> ENVIADO</> : 'CADASTRAR'}
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="container-x py-12 grid grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-urban-muted max-w-xs">
            {f.bio || 'Streetwear autêntico, feito por quem vive a cultura urbana.'}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-urban-muted">
            {g.storeAddress && <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 flex-shrink-0" /><span>{g.storeAddress}</span></li>}
            {g.storePhone   && <li className="flex items-center gap-2"><Phone size={14} className="flex-shrink-0" /><span>{g.storePhone}</span></li>}
            {g.storeEmail   && <li className="flex items-center gap-2"><Mail size={14} className="flex-shrink-0" /><span>{g.storeEmail}</span></li>}
          </ul>
          <div className="mt-5 flex items-center gap-2">
            <Social href={f.social?.instagram}><Instagram size={16} /></Social>
            <Social href={f.social?.facebook}><Facebook size={16} /></Social>
            <Social href={f.social?.twitter}><Twitter size={16} /></Social>
            <Social href={f.social?.youtube}><Youtube size={16} /></Social>
          </div>
        </div>

        {SECTIONS.map((s) => <FooterSection key={s.title} {...s} />)}
      </div>

      {/* Payments + seals */}
      <div className="border-t border-urban-border">
        <div className="container-x py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-urban-muted mb-2">FORMAS DE PAGAMENTO</div>
            <div className="flex flex-wrap gap-1.5">
              {(f.payments || []).map((p) => (
                <span key={p} className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider bg-urban-card border border-urban-border rounded-sm text-white/80">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-urban-muted mb-2">SEGURANÇA</div>
            <div className="flex flex-wrap gap-1.5">
              {(f.seals || []).map((s) => <Seal key={s}>{s}</Seal>)}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-urban-border">
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-urban-muted">
          <p>© {new Date().getFullYear()} {g.storeName || 'LION MODAS'} · CNPJ {g.cnpj || '—'}</p>
          <p>Todos os direitos reservados · Feito no Brasil</p>
        </div>
      </div>
    </footer>
  )
}

function FooterSection({ title, links }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-urban-border lg:border-0 pb-3 lg:pb-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between lg:cursor-default">
        <h4 className="text-xs font-bold tracking-widest text-white">{title}</h4>
        <ChevronDown size={16} className={`lg:hidden text-urban-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul className={`mt-4 space-y-2.5 ${open ? 'block' : 'hidden lg:block'}`}>
        {links.map((link) => (
          <li key={link}><a href="#" className="text-sm text-urban-muted hover:text-white transition-colors">{link}</a></li>
        ))}
      </ul>
    </div>
  )
}

function Social({ children, href }) {
  return (
    <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 grid place-items-center rounded-full border border-urban-border text-white/70 hover:text-white hover:border-urban-red hover:bg-urban-red/10 transition-all">
      {children}
    </a>
  )
}

function Seal({ children }) {
  return <span className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider bg-urban-card border border-urban-border rounded-sm text-emerald-400">✓ {children}</span>
}
