import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import Toast from "./Components/Toast.jsx";
import ScrollToTop from "./Components/ScrollToTop.jsx";

// Páginas
import Home from "./Pages/Home.jsx";
import ListProducts from "./Pages/ListProducts.jsx";
import Producto from "./Pages/Producto.jsx";
import Ofertas from "./Pages/Ofertas.jsx";
import Carrito from "./Pages/Carrito.jsx";
import Checkout from "./Pages/Checkout.jsx";
import NotFound from "./Pages/NotFound.jsx";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", paddingTop: "68px" }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Ruta Principal / Inicio */}
              <Route path="/" element={<Home />} />

              {/* Catálogo Completo */}
              <Route path="/productos" element={<ListProducts />} />

              {/* Vista por Categoría con useParams */}
              <Route path="/categoria/:categorySlug" element={<ListProducts />} />

              {/* Ofertas Especiales */}
              <Route path="/ofertas" element={<Ofertas />} />

              {/* Detalle de Producto con useParams */}
              <Route path="/producto/:id" element={<Producto />} />

              {/* Carrito de Compras */}
              <Route path="/carrito" element={<Carrito />} />

              {/* Proceso de Checkout */}
              <Route path="/checkout" element={<Checkout />} />

              {/* 404 No Encontrado */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
