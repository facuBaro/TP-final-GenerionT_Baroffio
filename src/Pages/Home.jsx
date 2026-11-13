import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroBanner from "../Components/HeroBanner.jsx";
import ProductoCard from "../Components/ProductoCard.jsx";
import "./Home.css";

const CATEGORIAS_DESTACADAS = [
  { slug: "smartphones", label: "Smartphones", index: "01" },
  { slug: "laptops", label: "Laptops & PC", index: "02" },
  { slug: "fragrances", label: "Perfumes", index: "03" },
  { slug: "beauty", label: "Belleza", index: "04" },
  { slug: "groceries", label: "Alimentos", index: "05" },
  { slug: "home-decoration", label: "Hogar & Deco", index: "06" },
];

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recargarTrigger, setRecargarTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let montado = true;
    const cargarDestacados = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await fetch("https://dummyjson.com/products?limit=8");
        if (!res.ok) throw new Error("Error al obtener destacados");
        const data = await res.json();
        if (montado && Array.isArray(data.products)) {
          setDestacados(data.products);
        }
      } catch (err) {
        console.error("Error al cargar destacados:", err);
        if (montado) setError("No pudimos cargar la selección. Revisá tu conexión e intentá de nuevo.");
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarDestacados();
    return () => {
      montado = false;
    };
  }, [recargarTrigger]);

  return (
    <div className="home-page">
      {/* Banner Principal con useNavigate */}
      <HeroBanner productos={destacados.slice(0, 2)} />

      {/* Sección de Categorías Rápidas */}
      <section className="home-section categories-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Explorá por Rubro</span>
              <h2 className="section-title">Categorías Populares</h2>
            </div>
            <button
              type="button"
              className="section-link-btn"
              onClick={() => navigate("/productos")}
            >
              Ver Todas →
            </button>
          </div>

          <div className="categories-grid">
            {CATEGORIAS_DESTACADAS.map((cat) => (
              <button
                type="button"
                key={cat.slug}
                className="category-pill-card"
                onClick={() => navigate(`/productos?category=${cat.slug}`)}
              >
                <span className="category-pill-card__icon">{cat.index}</span>
                <span className="category-pill-card__label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Productos Destacados */}
      <section className="home-section featured-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Una buena selección</span>
              <h2 className="section-title">Para descubrir</h2>
            </div>
            <button
              type="button"
              className="section-link-btn"
              onClick={() => navigate("/productos")}
            >
              Ver Catálogo Completo →
            </button>
          </div>

          {cargando ? (
            <div className="catalog-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-line skeleton-line--short"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line skeleton-line--price"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="home-load-error" role="alert">
              <p>{error}</p>
              <button type="button" className="section-link-btn" onClick={() => setRecargarTrigger((prev) => prev + 1)}>
                Volver a intentar
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {destacados.map((producto) => (
                <ProductoCard
                  key={producto.id}
                  id={producto.id}
                  title={producto.title}
                  price={producto.price}
                  thumbnail={producto.thumbnail}
                  category={producto.category}
                  stock={producto.stock}
                  rating={producto.rating}
                  discountPercentage={producto.discountPercentage}
                  brand={producto.brand}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner Promocional Extra */}
      <section className="home-promo-banner">
        <div className="promo-banner__container">
          <div className="promo-banner__content">
            <span className="promo-banner__badge">PRECIO ESPECIAL</span>
            <h2>Un buen hallazgo cambia el día.</h2>
            <p>
              Reunimos los productos con descuento en un solo lugar. Encontrá tu próximo favorito.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/ofertas")}
            >
              Explorar ofertas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
