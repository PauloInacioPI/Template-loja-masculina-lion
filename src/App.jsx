import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { StoreProvider } from './context/StoreContext'
import { SiteConfigProvider } from './context/SiteConfigContext'

// Loja pública
import StoreLayout from './components/StoreLayout'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'

// Painel admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminProducts from './pages/admin/Products'
import AdminCustomers from './pages/admin/Customers'
import AdminSettings from './pages/admin/Settings'
import AdminCatalog from './pages/admin/Catalog'
import AdminCoupons from './pages/admin/Coupons'
import AdminPlaceholder from './pages/admin/Placeholder'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteConfigProvider>
      <StoreProvider>
        <ScrollToTop />
        <Routes>
          {/* ===== Loja pública ===== */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<ProductsPage />} />
          </Route>

          {/* ===== Login do admin (sem layout) ===== */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ===== Painel admin ===== */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index               element={<AdminDashboard />} />
            <Route path="pedidos"      element={<AdminOrders />} />
            <Route path="produtos"     element={<AdminProducts />} />
            <Route path="clientes"     element={<AdminCustomers />} />
            <Route path="catalogo"     element={<AdminCatalog />} />
            <Route path="cupons"       element={<AdminCoupons />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="relatorios"   element={<AdminPlaceholder title="Relatórios" subtitle="Vendas por período, conversão, top produtos…" />} />
          </Route>
        </Routes>
      </StoreProvider>
      </SiteConfigProvider>
    </BrowserRouter>
  )
}
