import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import "./navbar.css";

export default function Navbar() {
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // useRef para manipular y enfocar el input de búsqueda
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Atajo de teclado: presionar "/" para enfocar la barra de búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Envío de búsqueda con useCallback
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const query = searchTerm.trim();
      if (query) {
        navigate(`/productos?q=${encodeURIComponent(query)}`);
      } else {
        navigate("/productos");
      }
      setIsMobileMenuOpen(false);
    },
    [searchTerm, navigate]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  }, []);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        {/* Logo / Marca */}
        <Link to="/" className="navbar__brand" aria-label="Ir a inicio">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" role="presentation">
              <path d="M5 13c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
              <path d="M5 22c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
              <path d="M5 31c4.3 0 4.3-5 8.6-5s4.3 5 8.6 5 4.3-5 8.8-5" />
            </svg>
          </span>
          <span className="navbar__logo-text">
            Marea<span className="navbar__logo-caption">selección diaria</span>
          </span>
        </Link>

        {/* Buscador Rápido con useRef */}
        <form className="navbar__search-form" onSubmit={handleSearchSubmit}>
          <div className="navbar__search-input-box">
            <span className="navbar__search-icon" aria-hidden="true">
            ⌕
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar productos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="navbar__search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="navbar__search-clear"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
          <button type="submit" className="navbar__search-btn">
            Buscar
          </button>
        </form>

        {/* Enlaces de navegación con NavLink */}
        <div className={`navbar__menu ${isMobileMenuOpen ? "is-open" : ""}`}>
          <ul className="navbar__links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/productos"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catálogo
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ofertas"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ofertas
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Botón Carrito & Toggle Móvil */}
        <div className="navbar__actions">
          <NavLink
            to="/carrito"
            className={({ isActive }) =>
              `navbar__cart-btn ${isActive ? "navbar__cart-btn--active" : ""}`
            }
            aria-label="Ver carrito de compras"
          >
            <span className="navbar__cart-icon" aria-hidden="true">
              🛒
            </span>
            <span className="navbar__cart-text">Carrito</span>
            <span
              className={`navbar__cart-badge ${totalItems > 0 ? "has-items" : ""}`}
            >
              {totalItems}
            </span>
          </NavLink>

          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
    </header>
  );
}