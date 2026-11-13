import { useState, useEffect, useCallback } from "react";
import ProductoCard from "../Components/ProductoCard.jsx";
import "./Ofertas.css";

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recargarTrigger, setRecargarTrigger] = useState(0);

  useEffect(() => {
    let montado = true;
    const cargarOfertas = async () => {
      try {
        const res = await fetch("https://dummyjson.com/products?limit=0");
        if (!res.ok) throw new Error("Error al obtener las ofertas.");
        const data = await res.json();
        const todos = Array.isArray(data.products) ? data.products : [];

        if (montado) {
          const filtrados = todos
            .filter((p) => p.discountPercentage && p.discountPercentage >= 10)
            .sort((a, b) => b.discountPercentage - a.discountPercentage);

          setOfertas(filtrados);
          setError(null);
          setCargando(false);
        }
      } catch (err) {
        if (montado) {
          console.error(err);
          setError("No se pudieron cargar las ofertas en este momento.");
          setCargando(false);
        }
      }
    };

    cargarOfertas();

    return () => {
      montado = false;
    };
  }, [recargarTrigger]);

  const handleReintentar = useCallback(() => {
    setCargando(true);
    setRecargarTrigger((prev) => prev + 1);
  }, []);

  return (
    <main className="ofertas-page">
      <header className="ofertas-header">
        <div className="ofertas-header__container">
          <span className="ofertas-eyebrow">Selección con descuento</span>
          <h1>Buenas oportunidades</h1>
          <p>
          Productos del catálogo de demostración con descuentos informados por la API.
          </p>
        </div>
      </header>

      <div className="ofertas-container">
        {cargando && (
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
        )}

        {error && (
          <div className="catalog-status catalog-status--error">
            <p>⚠️ {error}</p>
            <button type="button" className="btn btn-primary" onClick={handleReintentar}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && (
          ofertas.length > 0 ? (
            <div className="catalog-grid">
              {ofertas.map((producto) => (
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
          ) : (
            <div className="catalog-empty">
              <h2>Por ahora no hay ofertas para mostrar</h2>
              <p>Volvé a revisar más adelante o explorá el catálogo completo.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
