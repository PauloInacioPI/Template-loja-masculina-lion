// =====================================================================
//  Mock data SOMENTE para a UI do painel admin.
//  Substituir todos esses imports por chamadas reais ao backend.
//
//  Endpoints sugeridos:
//    GET  /api/admin/stats          → mockStats
//    GET  /api/admin/sales-chart    → mockSalesChart
//    GET  /api/admin/orders         → mockOrders
//    GET  /api/admin/orders/:id     → mockOrderDetail
//    GET  /api/admin/products       → mockProducts
//    GET  /api/admin/top-products   → mockTopProducts
//    GET  /api/admin/customers      → mockCustomers
//    POST /api/auth/login           → autenticação real
// =====================================================================

export const mockUser = {
  name: 'Pi Tech',
  email: 'admin@lionmodas.com.br',
  role: 'super',
  avatar: null,
}

export const mockStats = {
  ordersToday:    25,
  revenueToday:   4280.00,
  newCustomers:   12,
  totalCustomers: 1247,
  stockUnits:     3243,
  variantsLow:    14,
  ordersTotal:    312,
  revenueTotal:   89740.00,
}

// 7 dias de vendas (pra gráfico de barras)
export const mockSalesChart = [
  { day: 'Sex', value: 1820 },
  { day: 'Sáb', value: 2940 },
  { day: 'Dom', value: 2110 },
  { day: 'Seg', value: 3650 },
  { day: 'Ter', value: 2780 },
  { day: 'Qua', value: 4280 },
  { day: 'Qui', value: 3920 },
]

export const mockOrders = [
  { id: 1,  code: 'LION-2026-0014', customer: 'Marina Torres',  items: 3, total: 689.70, status: 'pending',   payment: 'pix',    createdAt: '2026-05-01 13:42' },
  { id: 2,  code: 'LION-2026-0013', customer: 'Carlos Mendes',  items: 1, total: 459.90, status: 'paid',      payment: 'credit', createdAt: '2026-05-01 12:18' },
  { id: 3,  code: 'LION-2026-0012', customer: 'Ana Beatriz',    items: 5, total: 1289.50, status: 'shipping', payment: 'pix',    createdAt: '2026-05-01 11:03' },
  { id: 4,  code: 'LION-2026-0011', customer: 'Rafael Costa',   items: 2, total: 349.80, status: 'delivered', payment: 'credit', createdAt: '2026-04-30 18:25' },
  { id: 5,  code: 'LION-2026-0010', customer: 'Juliana Pires',  items: 4, total: 967.60, status: 'paid',      payment: 'boleto', createdAt: '2026-04-30 16:12' },
  { id: 6,  code: 'LION-2026-0009', customer: 'Pedro Henrique', items: 1, total: 129.90, status: 'canceled',  payment: 'pix',    createdAt: '2026-04-30 14:45' },
  { id: 7,  code: 'LION-2026-0008', customer: 'Beatriz Lima',   items: 2, total: 589.80, status: 'delivered', payment: 'credit', createdAt: '2026-04-30 10:18' },
  { id: 8,  code: 'LION-2026-0007', customer: 'Lucas Rocha',    items: 3, total: 749.70, status: 'paid',      payment: 'pix',    createdAt: '2026-04-29 19:55' },
  { id: 9,  code: 'LION-2026-0006', customer: 'Fernanda Alves', items: 1, total: 219.90, status: 'shipping',  payment: 'boleto', createdAt: '2026-04-29 17:33' },
  { id: 10, code: 'LION-2026-0005', customer: 'Gabriel Souza',  items: 2, total: 459.80, status: 'delivered', payment: 'credit', createdAt: '2026-04-29 15:02' },
]

// Detalhe completo de UM pedido (abre modal)
export const mockOrderDetail = {
  id: 1,
  code: 'LION-2026-0014',
  status: 'pending',
  payment: 'pix',
  createdAt: '2026-05-01 13:42',
  customer: {
    name: 'Marina Torres',
    phone: '(22) 98160-5315',
    email: 'marina@email.com',
    cpf: '000.000.000-00',
  },
  shipping: {
    cep: '12345-678',
    address: 'Rua das Flores, 100, Apto 5',
    neighborhood: 'Centro',
    city: 'Macaé / RJ',
  },
  items: [
    { name: 'Hoodie Heavy Black', color: 'Preto', size: 'M', qty: 1, unitPrice: 349.90, lineTotal: 349.90, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&q=70&auto=format&fit=crop' },
    { name: 'Camiseta Box Logo',  color: 'Branco', size: 'G', qty: 2, unitPrice: 149.90, lineTotal: 299.80, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&q=70&auto=format&fit=crop' },
    { name: 'Boné Trucker Urban', color: 'Preto',  size: 'ÚNICO', qty: 1, unitPrice: 99.90, lineTotal: 99.90, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&q=70&auto=format&fit=crop' },
  ],
  totals: {
    subtotal: 749.60,
    shipping: 0,
    discount: 74.96,
    total: 674.64,
  },
  notes: 'Por favor, deixar na portaria.',
}

export const mockProducts = [
  { id: 1,  name: 'Camiseta Box Logo',     category: 'Camisetas',          brand: 'LION',         price: 149.90, stock: 87,  isActive: true,  isNew: true,  image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&q=70&auto=format&fit=crop' },
  { id: 2,  name: 'Hoodie Heavy Black',    category: 'Moletons & Hoodies', brand: 'LION',         price: 349.90, stock: 124, isActive: true,  isNew: true,  image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&q=70&auto=format&fit=crop' },
  { id: 3,  name: 'Calça Cargo Wide',      category: 'Calças',             brand: 'STREETLAB',    price: 289.90, stock: 56,  isActive: true,  isNew: true,  image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=70&auto=format&fit=crop' },
  { id: 4,  name: 'Boné Trucker Urban',    category: 'Bonés',              brand: 'LION',         price: 99.90,  stock: 178, isActive: true,  isNew: true,  image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&q=70&auto=format&fit=crop' },
  { id: 5,  name: 'Jaqueta Corta-Vento',   category: 'Jaquetas',           brand: 'LION',         price: 459.90, stock: 32,  isActive: true,  isNew: false, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=70&auto=format&fit=crop' },
  { id: 6,  name: 'Tênis Urban Runner',    category: 'Tênis',              brand: 'LION x KAOS',  price: 549.90, stock: 41,  isActive: true,  isNew: false, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=70&auto=format&fit=crop' },
  { id: 7,  name: 'Calça Jogger',          category: 'Calças',             brand: 'CREW',         price: 159.90, oldPrice: 229.90, stock: 9,  isActive: true,  isNew: false, image: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=200&q=70&auto=format&fit=crop' },
  { id: 8,  name: 'Camiseta Estampada',    category: 'Camisetas',          brand: 'LION x KAOS',  price: 79.90,  oldPrice: 119.90, stock: 0,  isActive: false, isNew: false, image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&q=70&auto=format&fit=crop' },
]

export const mockTopProducts = [
  { name: 'Camiseta Oversized', sales: 312, revenue: 40526.00 },
  { name: 'Hoodie Heavy Black', sales: 287, revenue: 100423.00 },
  { name: 'Boné Trucker Urban', sales: 211, revenue: 21080.00 },
  { name: 'Tênis Urban Runner', sales: 92,  revenue: 50590.00 },
  { name: 'Camiseta Box Logo',  sales: 132, revenue: 19786.00 },
]

export const mockCustomers = [
  { id: 1, name: 'Marina Torres',  phone: '(22) 98160-5315', email: 'marina@email.com',  orders: 3, total: 1689.70, lastOrder: '2026-05-01' },
  { id: 2, name: 'Carlos Mendes',  phone: '(11) 91234-5678', email: 'carlos@email.com',  orders: 7, total: 4520.30, lastOrder: '2026-05-01' },
  { id: 3, name: 'Ana Beatriz',    phone: '(31) 99876-5432', email: 'ana@email.com',     orders: 12, total: 8945.50, lastOrder: '2026-05-01' },
  { id: 4, name: 'Rafael Costa',   phone: '(21) 91111-2222', email: 'rafael@email.com',  orders: 2, total: 769.80,  lastOrder: '2026-04-30' },
  { id: 5, name: 'Juliana Pires',  phone: '(85) 98888-7777', email: 'ju@email.com',      orders: 5, total: 2867.40, lastOrder: '2026-04-30' },
]
