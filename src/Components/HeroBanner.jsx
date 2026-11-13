import { useNavigate } from "react-router-dom";
import "./HeroBanner.css";

export default function HeroBanner({ productos = [] }) {
  const navigate = useNavigate();
  const productoDestacado = productos[0];

  return (
    <section className="hero-banner">
      <div className="hero-banner__container">
        <div className="hero-banner__content">
          <div className="hero-banner__tag">
            <span className="hero-banner__tag-dot"></span>
            Curaduría de todos los días
          </div>
          <h1 className="hero-banner__title">
            Cosas buenas, <br />
            <span className="hero-banner__title-accent">elegidas para vos.</span>
          </h1>
          <p className="hero-banner__description">
            Una selección amplia para encontrar eso que mejora un poco cada día. Explorá, compará y elegí a tu ritmo.
          </p>
          <div className="hero-banner__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/productos")}
            >
              Explorar productos
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/ofertas")}
            >
              Ver ofertas
            </button>
          </div>
        </div>

        <div className="hero-banner__visual" aria-label="Productos destacados">
          <div className="hero-visual__orbit hero-visual__orbit--one"></div>
          <div className="hero-visual__orbit hero-visual__orbit--two"></div>
          <div className="hero-visual__main-card">
            {productoDestacado?.thumbnail ? (
              <img src={productoDestacado.thumbnail} alt={productoDestacado.title} />
            ) : (
              <div className="hero-visual__placeholder" aria-hidden="true">
                <span>m</span>
              </div>
            )}
            <div className="hero-visual__product-caption">
              <span>PARA DESCUBRIR</span>
              <strong>{productoDestacado?.title || "Una buena elección"}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
