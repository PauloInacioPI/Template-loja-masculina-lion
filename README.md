# Lion Modas — E-commerce de Streetwear

Loja completa com painel administrativo. Stack:

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node + Express + MySQL 8 (mysql2 + transações)
- **Checkout:** envia pedido via WhatsApp + persiste no banco com decremento de estoque

## Estrutura

```
.
├── src/                  # Frontend (loja pública + painel admin)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ProductsPage.jsx
│   │   └── admin/        # /admin/* (Dashboard, Pedidos, Produtos, ...)
│   ├── components/
│   ├── hooks/
│   ├── lib/api.js
│   └── context/
└── backend/
    ├── server.js         # Express
    ├── routes/           # products, orders, admin, site, upload
    ├── db/
    │   ├── schema.sql
    │   ├── seed.js
    │   ├── seed-settings.js
    │   └── migrate.js
    └── uploads/          # imagens enviadas pelo admin (gitignored)
```

## Setup local

### 1. Banco de dados

Pré-requisito: MySQL 8 rodando.

```bash
cd backend
cp .env.example .env             # ajuste DB_PASSWORD
npm install

# cria o schema
mysql -u root -p < db/schema.sql

# popula categorias, marcas, cores, produtos, variantes
npm run seed

# popula settings da loja (frete, hero, banners, ...)
npm run migrate
npm run seed:settings
```

### 2. Backend

```bash
cd backend
npm run dev          # http://localhost:3001
```

### 3. Frontend

```bash
cp .env.example .env # já vem com VITE_API_URL=http://localhost:3001
npm install
npm run dev          # http://localhost:5173
```

## Painel Admin

Acesse `http://localhost:5173/admin/login` (login mockado por enquanto).

| Rota | Função |
|---|---|
| `/admin` | Dashboard (stats, vendas 7 dias, top produtos) |
| `/admin/pedidos` | Lista + drawer + mudança de status (com estoque inteligente) |
| `/admin/produtos` | CRUD + variantes (cor + tamanho + estoque por SKU) |
| `/admin/catalogo` | CRUD de categorias, marcas, cores, tamanhos |
| `/admin/clientes` | CRUD de clientes |
| `/admin/cupons` | CRUD de cupons |
| `/admin/configuracoes` | Hero, banners, logo, frete, WhatsApp, instagram, footer |

## API endpoints

### Públicos
- `GET /api/products` — catálogo (apenas ativos com estoque > 0)
- `GET /api/site-config` — conteúdo editável (hero, banners, frete, etc)
- `POST /api/orders` — cria pedido (transação + decremento de estoque)
- `POST /api/newsletter` — cadastro de email

### Admin (`/api/admin/`)
- `products`, `customers`, `orders`, `coupons` — CRUD completo
- `categories`, `brands`, `colors`, `sizes` — CRUD
- `settings`, `settings/:key` — config da loja
- `upload` — POST multipart/form-data (limit 8 MB)
- `stats`, `sales-chart`, `top-products`, `newsletter`

## Estoque inteligente

- Ao criar pedido: estoque das variantes é decrementado (transação ACID).
- Pedido cancelado: estoque é **restaurado**.
- Pedido reativado (sai de cancelado): estoque é deduzido de novo (bloqueia se ficar negativo).

## Próximos passos sugeridos

- [ ] JWT real no painel admin (substituir login mockado)
- [ ] Hash bcrypt em `admin_users.password_hash`
- [ ] Página de detalhes do produto (PDP) na loja pública
- [ ] Filtros lookups vindos da API (hoje ainda em `data/products.js`)
- [ ] Upload via S3/Cloudinary em produção
- [ ] Relatórios mais detalhados
