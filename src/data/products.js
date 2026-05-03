// =====================================================================
//  data/products.js — LOOKUP TABLES (catálogos fixos)
//
//  Os PRODUTOS agora vêm do backend (GET /api/products via useProducts).
//  Aqui ficam só os arrays "estáticos" usados por:
//    - FiltersSidebar / FilterChips (opções de filtro)
//    - QuickViewModal / CartDrawer / CheckoutModal (lookup de cor pelo slug)
//
//  No futuro estes também podem virar endpoints (GET /api/colors etc.).
// =====================================================================

export const COLORS = [
  { id: 'black',  name: 'Preto',    hex: '#0a0a0a' },
  { id: 'white',  name: 'Branco',   hex: '#f4f4f4' },
  { id: 'gray',   name: 'Cinza',    hex: '#6b7280' },
  { id: 'beige',  name: 'Bege',     hex: '#d6c5a8' },
  { id: 'red',    name: 'Vermelho', hex: '#b91c1c' },
  { id: 'green',  name: 'Verde',    hex: '#3f5c3a' },
  { id: 'navy',   name: 'Azul',     hex: '#1e2a44' },
  { id: 'brown',  name: 'Marrom',   hex: '#5b3a29' },
]

export const TYPES = [
  { id: 'camisetas', name: 'Camisetas' },
  { id: 'moletons',  name: 'Moletons & Hoodies' },
  { id: 'jaquetas',  name: 'Jaquetas' },
  { id: 'calcas',    name: 'Calças' },
  { id: 'tenis',     name: 'Tênis' },
  { id: 'bones',     name: 'Bonés' },
  { id: 'mochilas',  name: 'Mochilas' },
  { id: 'beanies',   name: 'Beanies' },
]

export const GENDERS = [
  { id: 'masculino', name: 'Masculino' },
  { id: 'feminino',  name: 'Feminino' },
  { id: 'unissex',   name: 'Unissex' },
]

export const SIZES      = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
export const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44']

export const BRANDS = ['LION', 'LION x KAOS', 'CREW', 'STREETLAB']

export const instagramPhotos = [
  'https://images.unsplash.com/photo-1517593456449-1cf91d048da6?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496346903040-c1de8d09f404?w=400&q=80&auto=format&fit=crop',
]
