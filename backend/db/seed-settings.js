// =====================================================================
//  seed-settings.js — popula a tabela site_settings com valores default
//  npm run seed:settings
// =====================================================================

import 'dotenv/config'
import { pool } from './db.js'

const SETTINGS = {
  general: {
    storeName: 'LION MODAS',
    storeEmail: 'contato@lionmodas.com.br',
    storePhone: '(11) 4002-8922',
    storeAddress: 'Rua Augusta, 1234 — Consolação, São Paulo / SP',
    cnpj: '00.000.000/0001-00',
    whatsappNumber: '5511999999999',
    freeShippingAt: 299,
    flatShipping: 19.90,
    pixDiscountPercent: 10,
  },
  topBar: [
    { icon: 'Truck', text: 'FRETE GRÁTIS para todo o Brasil em compras acima de R$ 299' },
    { text: '10% OFF no PIX em todas as peças' },
    { text: 'PARCELE EM ATÉ 10X SEM JUROS no cartão' },
  ],
  hero: [
    {
      eyebrow: 'COLEÇÃO FW26',
      title: 'NEW DROP',
      subtitle: 'A nova temporada chegou — peças limitadas, atitude ilimitada.',
      cta: 'COMPRAR COLEÇÃO',
      href: '/produtos?novos=1',
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=85&auto=format&fit=crop',
      align: 'left',
    },
    {
      eyebrow: 'EDITORIAL',
      title: 'STREET CULTURE',
      subtitle: 'Inspirado nas ruas, feito para você.',
      cta: 'VER LOOKBOOK',
      href: '/produtos',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85&auto=format&fit=crop',
      align: 'right',
    },
    {
      eyebrow: 'SALE',
      title: 'ATÉ 50% OFF',
      subtitle: 'Promoção por tempo limitado — peças selecionadas.',
      cta: 'VER PROMOÇÕES',
      href: '/produtos?promocao=1',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85&auto=format&fit=crop',
      align: 'left',
    },
  ],
  bannerDuo: [
    { title: 'MASCULINO', subtitle: 'Streetwear autêntico', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=85&auto=format&fit=crop', to: '/produtos?genero=masculino' },
    { title: 'FEMININO',  subtitle: 'Atitude e estilo',     image: 'https://images.unsplash.com/photo-1529903384028-929ae5dccdf1?w=1200&q=85&auto=format&fit=crop', to: '/produtos?genero=feminino'  },
  ],
  editorialBanner: {
    eyebrow: 'LOOKBOOK FW26',
    title: 'STREET\nATTITUDE',
    subtitle: 'Inspirado nas ruas de São Paulo, Tóquio e Nova York. A nova coleção que traduz cultura urbana em peças que duram.',
    cta: 'EXPLORAR LOOKBOOK',
    href: '/produtos?novos=1',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&q=85&auto=format&fit=crop',
  },
  trustBar: [
    { icon: 'Truck',       title: 'FRETE GRÁTIS',   sub: 'em compras acima de R$ 299' },
    { icon: 'RotateCcw',   title: 'TROCA GRÁTIS',   sub: 'em até 30 dias' },
    { icon: 'ShieldCheck', title: 'COMPRA SEGURA',  sub: 'site protegido com SSL' },
    { icon: 'CreditCard',  title: '10X SEM JUROS',  sub: 'ou 10% OFF no PIX' },
  ],
  instagram: [
    'https://images.unsplash.com/photo-1517593456449-1cf91d048da6?w=400&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=400&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496346903040-c1de8d09f404?w=400&q=80&auto=format&fit=crop',
  ],
  footer: {
    bio: 'Streetwear autêntico, feito por quem vive a cultura urbana. Desde 2019.',
    social: { instagram: '#', facebook: '#', twitter: '#', youtube: '#' },
    payments: ['VISA', 'MASTER', 'ELO', 'AMEX', 'HIPER', 'PIX', 'BOLETO'],
    seals: ['SSL', 'RECLAME AQUI', 'EBIT', 'GOOGLE SAFE'],
  },
}

async function run() {
  console.log('🌱 Seed de configurações…')
  for (const [key, value] of Object.entries(SETTINGS)) {
    await pool.query(
      `INSERT INTO site_settings (\`key\`, \`value\`)
       VALUES (?, CAST(? AS JSON))
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      [key, JSON.stringify(value)]
    )
    console.log(`  ✓ ${key}`)
  }
  console.log('Pronto.')
  await pool.end()
}

run().catch((e) => { console.error(e); process.exit(1) })
