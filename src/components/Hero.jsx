import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function Hero() {
  const { config } = useSiteConfig()
  const slides = config.hero || []
  const [i, setI] = useState(0)
  const last = slides.length - 1

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setI((v) => (v === last ? 0 : v + 1)), 6500)
    return () => clearInterval(id)
  }, [last, slides.length])

  if (slides.length === 0) return null

  const prev = () => setI((v) => (v === 0 ? last : v - 1))
  const next = () => setI((v) => (v === last ? 0 : v + 1))

  return (
    <section id="inicio" className="relative">
      <div className="relative h-[560px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-urban-card">
        {slides.map((s, idx) => (<Slide key={idx} slide={s} active={idx === i} />))}

        {slides.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={prev} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur border border-white/10">
              <ChevronLeft size={20} />
            </button>
            <button aria-label="Próximo" onClick={next} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur border border-white/10">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${idx === i ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function Slide({ slide, active }) {
  return (
    <div className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <img src={slide.image} alt={slide.title} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ${active ? 'scale-105' : 'scale-100'}`} />
      <div className={`absolute inset-0 ${slide.align === 'left' ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent' : 'bg-gradient-to-l from-black/80 via-black/40 to-transparent'}`} />
      <div className="relative h-full container-x flex items-center">
        <div className={`max-w-xl ${slide.align === 'right' ? 'ml-auto text-right' : ''}`}>
          {slide.eyebrow && <div className="text-[11px] font-semibold tracking-[0.25em] text-urban-red mb-4">{slide.eyebrow}</div>}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight">{slide.title}</h1>
          {slide.subtitle && <p className="mt-5 text-base sm:text-lg text-white/85 max-w-md">{slide.subtitle}</p>}
          {slide.cta && (
            <Link to={slide.href || '/produtos'} className="mt-8 inline-flex items-center gap-2.5 bg-white text-urban-bg font-semibold text-sm tracking-widest px-7 py-4 hover:bg-urban-red hover:text-white transition-colors group">
              {slide.cta}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
