import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import "./carrito.css";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

export default function Carrito() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  // Cálculos de resumen
  const subtotal = totalPrice;
  const costoEnvio = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const totalFinal = subtotal + costoEnvio;

  return (
    <main className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <div>
            <span className="cart-eyebrow">Tu Orden</span>
            <h1>Carrito de Compras</h1>
            <p>Revisá tus artículos seleccionados antes de avanzar al pago.</p>
          </div>
          {cart.length > 0 && (
            <span className="cart-badge-counter">
              {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
            </span>
          )}
        </header>

        {cart.length === 0 ? (
          <section className="cart-empty-box">
            <span className="cart-empty-icon" aria-hidden="true">
              🛒
            </span>
            <h2>Tu carrito está vacío</h2>
            <p>
              Todavía no agregaste ningún producto a tu lista. ¡Explorá nuestro catálogo y encontrá lo que buscás!
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/productos")}
            >
              Explorar Catálogo 🛍️
            </button>
          </section>
        ) : (
          <div className="cart-layout">
            {/* Lista de Productos en el Carrito */}
            <section className="cart-items-section" aria-label="Productos en el carrito">
              <div className="cart-items-header">
                <h2>Artículos ({totalItems})</h2>
                <button
                  type="button"
                  className="cart-btn-clear"
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </button>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => {
                  const cant = item.quantity || item.cantidad || 1;
                  const itemPrice = item.price ?? item.precio ?? 0;
                  const img = item.thumbnail || (item.images && item.images[0]) || (item.imagen && item.imagen[0]);

                  return (
                    <article key={item.id} className="cart-item">
                      <div className="cart-item__image-box">
                        {img ? (
                          <img src={img} alt={item.title} />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>

                      <div className="cart-item__info">
                        <Link
                          to={`/producto/${item.id}`}
                          state={{ from: "/carrito" }}
                          className="cart-item__title"
                        >
                          {item.title}
                        </Link>
                        <span className="cart-item__price-unit">
                          {formatoMoneda.format(itemPrice)} por unidad
                        </span>
                        {item.category && (
                          <span className="cart-item__category-tag">{item.category}</span>
                        )}
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="cart-item__quantity">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, cant - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="qty-value">{cant}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, cant + 1)}
                          disabled={item.stock && cant >= item.stock}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      {/* Total por ítem y eliminar */}
                      <div className="cart-item__subtotal">
                        <strong>{formatoMoneda.format(itemPrice * cant)}</strong>
                        <button
                          type="button"
                          className="cart-item__remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Eliminar ${item.title}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="cart-footer-links">
                <Link to="/productos" className="cart-btn-continue">
                  ← Seguir comprando en el catálogo
                </Link>
              </div>
            </section>

            {/* Resumen del Pedido */}
            <aside className="cart-summary-section" aria-label="Resumen de la orden">
              <h2>Resumen de la Compra</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>{formatoMoneda.format(subtotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Envío a domicilio</span>
                  <span>
                    {costoEnvio === 0 ? (
                      <strong className="shipping-free">¡GRATIS!</strong>
                    ) : (
                      formatoMoneda.format(costoEnvio)
                    )}
                  </span>
                </div>

                {subtotal <= 50 && subtotal > 0 && (
                  <p className="shipping-hint">
                    💡 Agregá {formatoMoneda.format(50 - subtotal)} más para obtener <strong>Envío Gratis</strong>.
                  </p>
                )}

                <div className="summary-row summary-row--total">
                  <span>Total Final</span>
                  <strong>{formatoMoneda.format(totalFinal)}</strong>
                </div>
              </div>

              {/* Botón de Checkout usando useNavigate */}
              <button
                type="button"
                className="btn btn-primary btn-checkout"
                onClick={() => navigate("/checkout")}
              >
                Continuar al Checkout 💳
              </button>

            </aside>
          </div>
        )}
      </div>
    </main>
  );
}