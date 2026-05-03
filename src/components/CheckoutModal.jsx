import { useEffect, useState } from 'react'
import { X, ArrowLeft, ShieldCheck, Check, MessageCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useStore, formatBRL } from '../context/StoreContext'
import { useSiteConfig } from '../context/SiteConfigContext'
import { COLORS } from '../data/products'
import { createOrder } from '../lib/api'

const PAYMENTS = [
  { id: 'pix',     label: 'PIX',       sub: '10% OFF — confirmação na hora' },
  { id: 'credit',  label: 'CARTÃO',    sub: 'até 10x sem juros' },
  { id: 'boleto',  label: 'BOLETO',    sub: 'compensa em até 2 dias úteis' },
]

const onlyDigits = (s) => s.replace(/\D/g, '')

const fmtCEP = (v) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
const fmtPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}
const fmtCPF = (v) => onlyDigits(v).slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const initialForm = {
  name: '', phone: '', email: '', cpf: '',
  cep: '', address: '', number: '', complement: '', neighborhood: '',
  city: '', uf: '',
  payment: 'pix',
  notes: '',
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, cart, subtotal, clearCart } = useStore()
  const { config } = useSiteConfig()
  const WHATS_NUMBER     = config.general?.whatsappNumber  || '5511999999999'
  const FREE_SHIPPING_AT = Number(config.general?.freeShippingAt ?? 299)
  const FLAT_SHIPPING    = Number(config.general?.flatShipping   ?? 19.90)
  const PIX_PCT          = Number(config.general?.pixDiscountPercent ?? 10) / 100
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    document.body.style.overflow = checkoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [checkoutOpen])

  if (!checkoutOpen) return null

  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : FLAT_SHIPPING
  const pixDiscount = form.payment === 'pix' ? subtotal * PIX_PCT : 0
  const total = subtotal + shipping - pixDiscount

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Informe seu nome'
    if (onlyDigits(form.phone).length < 10) e.phone = 'Telefone inválido'
    if (form.email && !/.+@.+\..+/.test(form.email)) e.email = 'Email inválido'
    if (onlyDigits(form.cep).length !== 8) e.cep = 'CEP inválido'
    if (!form.address.trim()) e.address = 'Informe o endereço'
    if (!form.number.trim()) e.number = 'Nº'
    if (!form.neighborhood.trim()) e.neighborhood = 'Bairro'
    if (!form.city.trim()) e.city = 'Cidade'
    if (!form.uf.trim()) e.uf = 'UF'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const sendToWhatsApp = async () => {
    if (cart.length === 0) return
    if (submitting) return
    if (!validate()) {
      const first = Object.keys(errors)[0]
      if (first) document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // 1. Salvar o pedido no banco (servidor recalcula totais e trava estoque)
      const order = await createOrder({
        customer: {
          name:  form.name,
          phone: form.phone,
          email: form.email || null,
          cpf:   form.cpf || null,
        },
        address: {
          cep: form.cep, street: form.address, number: form.number,
          complement: form.complement || null, neighborhood: form.neighborhood,
          city: form.city, uf: form.uf,
        },
        items: cart.map((l) => ({
          productId: l.productId,
          color: l.color,
          size: l.size,
          quantity: l.qty,
        })),
        payment_method: form.payment,
        notes: form.notes || null,
        whatsapp_sent: true,
      })

      // 2. Montar mensagem do WhatsApp já com o CÓDIGO oficial do pedido
      const payment = PAYMENTS.find((p) => p.id === form.payment)
      const lines = cart.map((l) => {
        const colorName = COLORS.find((c) => c.id === l.color)?.name || ''
        return `• ${l.qty}x ${l.name}${colorName ? ` (${colorName}` : ''}${l.size ? `${colorName ? ', ' : ' ('}${l.size})` : colorName ? ')' : ''} — ${formatBRL(l.price * l.qty)}`
      }).join('\n')

      const msg = [
        `🛍️ *PEDIDO ${order.code} — LION MODAS*`,
        '',
        '👤 *Cliente*',
        `Nome: ${form.name}`,
        `Telefone: ${form.phone}`,
        form.email && `Email: ${form.email}`,
        form.cpf && `CPF: ${form.cpf}`,
        '',
        '📍 *Endereço de entrega*',
        `${form.address}, ${form.number}${form.complement ? ` - ${form.complement}` : ''}`,
        `${form.neighborhood} — ${form.city}/${form.uf.toUpperCase()}`,
        `CEP: ${form.cep}`,
        '',
        '🛒 *Itens do pedido*',
        lines,
        '',
        '💰 *Resumo*',
        `Subtotal: ${formatBRL(order.subtotal)}`,
        `Frete: ${order.shipping === 0 ? 'GRÁTIS' : formatBRL(order.shipping)}`,
        order.discount > 0 && `Desconto PIX (10%): -${formatBRL(order.discount)}`,
        `*TOTAL: ${formatBRL(order.total)}*`,
        '',
        '💳 *Forma de pagamento*',
        `${payment.label} — ${payment.sub}`,
        form.notes && '',
        form.notes && '📝 *Observações*',
        form.notes && form.notes,
      ].filter(Boolean).join('\n')

      const url = `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank', 'noopener')

      // 3. Limpar e fechar
      setTimeout(() => {
        clearCart()
        closeCheckout()
        setForm(initialForm)
        setSubmitError(null)
      }, 800)
    } catch (err) {
      // Erro do backend (validação, estoque, conexão) — modal continua aberto
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-urban-bg/95 backdrop-blur-sm overflow-y-auto">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 bg-urban-bg border-b border-urban-border z-10">
        <div className="container-x h-14 flex items-center justify-between">
          <button
            onClick={closeCheckout}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <h2 className="text-sm font-bold tracking-widest">FINALIZAR COMPRA</h2>
          <button onClick={closeCheckout} aria-label="Fechar" className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="w-full pt-20 pb-10">
        <div className="container-x grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10">
          {/* Form */}
          <div className="space-y-7 min-w-0">
            <Section title="1. IDENTIFICAÇÃO">
              <Row>
                <Field id="f-name" label="Nome completo *" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Seu nome"
                    className={inputCls(errors.name)}
                  />
                </Field>
              </Row>
              <Row>
                <Field id="f-phone" label="Telefone / WhatsApp *" error={errors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', fmtPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className={inputCls(errors.phone)}
                  />
                </Field>
                <Field id="f-cpf" label="CPF (opcional)" error={errors.cpf}>
                  <input
                    value={form.cpf}
                    onChange={(e) => set('cpf', fmtCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={inputCls(errors.cpf)}
                  />
                </Field>
              </Row>
              <Row>
                <Field id="f-email" label="E-mail (opcional)" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="seu@email.com"
                    className={inputCls(errors.email)}
                  />
                </Field>
              </Row>
            </Section>

            <Section title="2. ENDEREÇO DE ENTREGA">
              <Row>
                <Field id="f-cep" label="CEP *" error={errors.cep} className="max-w-[180px]">
                  <input
                    value={form.cep}
                    onChange={(e) => set('cep', fmtCEP(e.target.value))}
                    placeholder="00000-000"
                    className={inputCls(errors.cep)}
                  />
                </Field>
              </Row>
              <Row>
                <Field id="f-address" label="Endereço *" error={errors.address} className="flex-1">
                  <input
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Rua, avenida…"
                    className={inputCls(errors.address)}
                  />
                </Field>
                <Field id="f-number" label="Número *" error={errors.number} className="max-w-[120px]">
                  <input
                    value={form.number}
                    onChange={(e) => set('number', e.target.value)}
                    placeholder="123"
                    className={inputCls(errors.number)}
                  />
                </Field>
              </Row>
              <Row>
                <Field id="f-complement" label="Complemento" className="flex-1">
                  <input
                    value={form.complement}
                    onChange={(e) => set('complement', e.target.value)}
                    placeholder="Apto, bloco…"
                    className={inputCls()}
                  />
                </Field>
                <Field id="f-neighborhood" label="Bairro *" error={errors.neighborhood} className="flex-1">
                  <input
                    value={form.neighborhood}
                    onChange={(e) => set('neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className={inputCls(errors.neighborhood)}
                  />
                </Field>
              </Row>
              <Row>
                <Field id="f-city" label="Cidade *" error={errors.city} className="flex-1">
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="Cidade"
                    className={inputCls(errors.city)}
                  />
                </Field>
                <Field id="f-uf" label="UF *" error={errors.uf} className="max-w-[100px]">
                  <input
                    value={form.uf}
                    onChange={(e) => set('uf', e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    className={inputCls(errors.uf)}
                  />
                </Field>
              </Row>
            </Section>

            <Section title="3. FORMA DE PAGAMENTO">
              <div className="grid sm:grid-cols-3 gap-3">
                {PAYMENTS.map((p) => {
                  const active = form.payment === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set('payment', p.id)}
                      className={`text-left p-4 border rounded-sm transition-colors relative ${
                        active
                          ? 'border-urban-red bg-urban-red/10'
                          : 'border-urban-border hover:border-white'
                      }`}
                    >
                      {active && (
                        <span className="absolute top-2 right-2 w-5 h-5 grid place-items-center rounded-full bg-urban-red text-white">
                          <Check size={11} />
                        </span>
                      )}
                      <div className="text-sm font-bold tracking-widest">{p.label}</div>
                      <div className="text-[11px] text-urban-muted mt-1">{p.sub}</div>
                    </button>
                  )
                })}
              </div>
            </Section>

            <Section title="4. OBSERVAÇÕES (OPCIONAL)">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Algum recado para a equipe? Ponto de referência?"
                rows={3}
                className={inputCls() + ' resize-none'}
              />
            </Section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-urban-card border border-urban-border rounded-sm p-5">
              <h3 className="text-xs font-bold tracking-widest mb-4">RESUMO DO PEDIDO</h3>

              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((l) => (
                  <li key={l.key} className="flex gap-3">
                    <div className="w-14 h-16 flex-shrink-0 bg-urban-bg rounded-sm overflow-hidden relative">
                      <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-urban-red text-[10px] font-bold">
                        {l.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium uppercase line-clamp-2">{l.name}</h4>
                      <div className="text-[10px] text-urban-muted mt-0.5">
                        {COLORS.find((c) => c.id === l.color)?.name} · {l.size}
                      </div>
                      <div className="text-xs font-bold mt-1">{formatBRL(l.price * l.qty)}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-urban-border space-y-1.5 text-sm">
                <Row2 label="Subtotal" value={formatBRL(subtotal)} />
                <Row2
                  label="Frete"
                  value={shipping === 0 ? <span className="text-emerald-400 font-semibold">GRÁTIS</span> : formatBRL(shipping)}
                />
                {pixDiscount > 0 && (
                  <Row2 label="Desconto PIX (10%)" value={<span className="text-emerald-400">-{formatBRL(pixDiscount)}</span>} />
                )}
                <div className="pt-3 mt-2 border-t border-urban-border flex items-baseline justify-between">
                  <span className="text-xs text-urban-muted">TOTAL</span>
                  <span className="text-2xl font-bold">{formatBRL(total)}</span>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 flex items-start gap-2 p-3 border border-urban-red/40 bg-urban-red/10 rounded-sm">
                  <AlertTriangle size={14} className="text-urban-red mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-white/90">{submitError}</span>
                </div>
              )}

              <button
                onClick={sendToWhatsApp}
                disabled={cart.length === 0 || submitting}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-widest h-12 transition-colors"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> ENVIANDO PEDIDO…</>
                ) : (
                  <><MessageCircle size={16} /> ENVIAR PEDIDO PELO WHATSAPP</>
                )}
              </button>

              <p className="mt-3 text-[11px] text-urban-muted text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} />
                Pedido salvo no banco · Mensagem segue pelo WhatsApp
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-xs font-bold tracking-widest mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Row({ children }) {
  return <div className="flex flex-col sm:flex-row gap-3">{children}</div>
}

function Row2({ label, value }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-urban-muted">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

function Field({ id, label, error, children, className = '' }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="text-[11px] text-urban-red mt-1 block">{error}</span>}
    </label>
  )
}

function inputCls(error) {
  return `w-full bg-urban-card border rounded-sm px-3.5 h-11 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red transition-colors ${
    error ? 'border-urban-red' : 'border-urban-border'
  }`
}
