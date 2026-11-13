import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import "./ProductoCard.css";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

export default function ProductoCard({
  id,
  title,
  nombre,
  price,
  precio,
  thumbnail,
  imagen,
  category,
  stock,
  rating = 4.5,
  discountPercentage = 0,
  brand,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart } = useCart();

  const finalTitle = title || nombre || "Producto";
  const finalPrice = price ?? precio ?? 0;
  const finalImg =
    thumbnail ||
    (Array.isArray(imagen) ? imagen[0] : imagen) ||
    "https://via.placeholder.com/300";

  // Buscar si ya está en el carrito
  const itemEnCarrito = cart.find((item) => item.id === id);
  const cantidadEnCarrito = itemEnCarrito ? (itemEnCarrito.quantity || itemEnCarrito.cantidad || 0) : 0;

  // Navegar al detalle del producto usando useNavigate
  const handleVerDetalle = useCallback(() => {
    navigate(`/producto/${id}`, {
      state: { from: `${location.pathname}${location.search}` },
    });
  }, [navigate, id, location.pathname, location.search]);

  // Agregar al carrito usando useCart
  const handleAgregar = useCallback(
    (e) => {
      e.stopPropagation();
      addToCart({
        id,
        title: finalTitle,
        price: finalPrice,
        thumbnail: finalImg,
        category,
        stock,
        discountPercentage,
      });
    },
    [addToCart, id, finalTitle, finalPrice, finalImg, category, stock, discountPercentage]
  );

  // Precio anterior calculado si hay descuento
  const tieneDescuento = discountPercentage > 5;
  const precioOriginal = tieneDescuento
    ? finalPrice / (1 - discountPercentage / 100)
    : null;

  return (
    <article
      className={`product-card ${stock <= 0 ? "product-card--out" : ""}`}
      onClick={handleVerDetalle}
    >
      {/* Contenedor de Imagen y Badges */}
      <div className="product-card__image-box">
        <img
          src={finalImg}
          alt={finalTitle}
          className="product-card__img"
          loading="lazy"
        />

        {tieneDescuento && (
          <span className="product-card__badge-discount">
            -{Math.round(discountPercentage)}%
          </span>
        )}

        <div className="product-card__badge-rating">
          <span className="product-card__star">★</span>
          <span>{Number(rating).toFixed(1)}</span>
        </div>
      </div>

      {/* Cuerpo de la Card */}
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{category || "General"}</span>
          {brand && <span className="product-card__brand">{brand}</span>}
        </div>

        <h3 className="product-card__title" title={finalTitle}>
          {finalTitle}
        </h3>

        {/* Precios */}
        <div className="product-card__pricing">
          <span className="product-card__price">{formatoMoneda.format(finalPrice)}</span>
          {precioOriginal && (
            <span className="product-card__price-original">
              {formatoMoneda.format(precioOriginal)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="product-card__stock-status">
          {stock > 0 ? (
            <span className="product-card__stock-in">
              <span className="stock-dot"></span> {stock} disponibles
            </span>
          ) : (
            <span className="product-card__stock-out">Sin stock</span>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="product-card__actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="product-card__btn-detail"
            onClick={handleVerDetalle}
          >
            Ver más
          </button>
          <button
            type="button"
            className={`product-card__btn-add ${cantidadEnCarrito > 0 ? "is-added" : ""}`}
            onClick={handleAgregar}
            disabled={stock <= 0 || cantidadEnCarrito >= stock}
          >
            {stock <= 0
              ? "Agotado"
              : cantidadEnCarrito > 0
              ? `En carrito (${cantidadEnCarrito})`
              : "Añadir 🛒"}
          </button>
        </div>
      </div>
    </article>
  );
}
