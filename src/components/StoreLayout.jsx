// =====================================================================
//  Layout da loja pública (envolve "/" e "/produtos").
//  Renderiza TopBar + Header + conteúdo da rota + Footer.
//  Os modais globais (carrinho, quickview, checkout) também moram aqui.
// =====================================================================

import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Header from './Header'
import Footer from './Footer'
import QuickViewModal from './QuickViewModal'
import CartDrawer from './CartDrawer'
import CheckoutModal from './CheckoutModal'

export default function StoreLayout() {
  return (
    <>
      <div className="min-h-screen bg-urban-bg text-white flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      <QuickViewModal />
      <CartDrawer />
      <CheckoutModal />
    </>
  )
}
