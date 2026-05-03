// =====================================================================
//  /admin/login — UI da autenticação do painel.
//
//  TODO (você):
//    - Trocar handleSubmit por POST /api/auth/login
//    - Salvar token JWT no localStorage
//    - Redirecionar pra /admin se autenticou; mostrar erro se 401
// =====================================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    // TODO (você): chamada real à API. Aqui só simula um delay.
    setTimeout(() => {
      setSubmitting(false)
      navigate('/admin')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-urban-bg text-white flex">
      {/* Lado esquerdo — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
            <img src="/lion-logo-white.png" alt="" className="w-9 h-9 object-contain" />
            <div>
              <div className="font-display tracking-[0.2em] text-lg leading-tight">LION</div>
              <div className="text-[10px] tracking-[0.25em] text-urban-muted leading-tight">ADMIN</div>
            </div>
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-2">
            Entrar no painel
          </h1>
          <p className="text-sm text-urban-muted mb-10">
            Acesso restrito a administradores autorizados.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="E-mail">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@lionmodas.com.br"
                className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-3 h-12 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
              />
            </Field>

            <Field label="Senha">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-urban-muted" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-urban-card border border-urban-border rounded-md pl-10 pr-11 h-12 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-urban-muted hover:text-white"
                aria-label="Mostrar senha"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white/80">
                <input type="checkbox" className="accent-urban-red" />
                Lembrar de mim
              </label>
              <a href="#" className="text-urban-muted hover:text-white">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-urban-red hover:bg-urban-red-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold tracking-widest text-sm h-12 transition-colors mt-2"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> ENTRANDO…</>
              ) : (
                <>ENTRAR <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-xs text-urban-muted">
            Voltar para a <Link to="/" className="text-white hover:underline">loja</Link>.
          </p>
        </div>
      </div>

      {/* Lado direito — visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-l border-urban-border">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-urban-bg/95 via-urban-bg/70 to-urban-red/30" />
        <div className="relative flex flex-col justify-end p-12">
          <div className="text-[11px] font-semibold tracking-[0.25em] text-urban-red mb-3">
            LION MODAS · ADMIN
          </div>
          <h2 className="font-display text-5xl xl:text-6xl tracking-tight leading-[0.95] max-w-md">
            Gestão completa<br />da sua loja.
          </h2>
          <p className="mt-5 text-sm text-white/70 max-w-sm">
            Pedidos, estoque, clientes e métricas — tudo em um lugar só.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-wide text-urban-muted block mb-1.5">
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  )
}
