import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand-col">
          <div className="footer__brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 36 36" role="presentation">
                <path d="M5 13c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
                <path d="M5 22c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
                <path d="M5 31c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
              </svg>
            </span>
            <span className="footer__logo-text">
              Marea
            </span>
          </div>
          <p className="footer__desc">
            Una tienda para explorar productos, comparar opciones y encontrar algo para todos los días.
          </p>
        </div>

        <div className="footer__nav-col">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Catálogo de Productos</Link></li>
            <li><Link to="/ofertas">Ofertas y Descuentos</Link></li>
            <li><Link to="/carrito">Mi Carrito</Link></li>
          </ul>
        </div>

        <div className="footer__nav-col">
          <h4>Categorías Populares</h4>
          <ul>
            <li><Link to="/productos?category=smartphones">Smartphones</Link></li>
            <li><Link to="/productos?category=laptops">Laptops & PC</Link></li>
            <li><Link to="/productos?category=fragrances">Perfumería</Link></li>
            <li><Link to="/productos?category=beauty">Belleza & Cuidado</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Marea. Precios expresados en USD.</p>
      </div>
    </footer>
  );
}
