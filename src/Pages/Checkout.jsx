import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import "./checkout.css";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

export default function Checkout() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const costoEnvio = totalPrice > 50 || totalPrice === 0 ? 0 : 9.99;
  const totalFinal = totalPrice + costoEnvio;

  // Estados del formulario y pedido
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
  });

  const [procesando, setProcesando] = useState(false);
  const [ordenCompletada, setOrdenCompletada] = useState(null);

  // Manejo de cambios en el formulario con useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Procesamiento de la orden con useCallback y async
  const handleConfirmarPedido = useCallback(
    async (e) => {
      e.preventDefault();
      setProcesando(true);

      // Simulamos la llamada a una API de cobros / órdenes con promesa
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const nuevaOrden = {
        idOrden: `MAR-${Math.floor(100000 + Math.random() * 900000)}`,
        fecha: new Date().toLocaleDateString("es-AR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: [...cart],
        total: totalFinal,
        cliente: { ...formData },
      };

      setOrdenCompletada(nuevaOrden);
      clearCart();
      setProcesando(false);
    },
    [cart, totalFinal, formData, clearCart]
  );

  // Volver a la tienda con useNavigate
  const handleVolverTienda = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Si no hay productos y no se acaba de confirmar una orden
  if (cart.length === 0 && !ordenCompletada) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty-card">
          <span className="checkout-empty-icon">🛍️</span>
          <span className="checkout-eyebrow">Sin Artículos</span>
          <h2>No hay una orden pendiente</h2>
          <p>Para realizar un pedido, primero debes agregar artículos a tu carrito de compras.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/productos")}
          >
            Explorar Catálogo 🛒
          </button>
        </div>
      </main>
    );
  }

  // Pantalla de Confirmación de Pedido
  if (ordenCompletada) {
    return (
      <main className="checkout-page">
        <div className="checkout-success-card">
          <div className="checkout-success-header">
            <div className="success-icon-badge">✓</div>
            <span className="checkout-eyebrow">Compra realizada con éxito</span>
            <h1>
              {ordenCompletada.cliente.nombre
                ? `¡Gracias por comprar, ${ordenCompletada.cliente.nombre}!`
                : "¡Gracias por comprar!"}
            </h1>
          </div>

          <div className="order-details-box">
            <div className="order-details-header">
              <div>
                <span className="order-id-label">Número de referencia:</span>
                <strong className="order-id-value">#{ordenCompletada.idOrden}</strong>
              </div>
              <div>
                <span className="order-date-label">Fecha:</span>
                <span className="order-date-value">{ordenCompletada.fecha}</span>
              </div>
            </div>

            {(ordenCompletada.cliente.direccion || ordenCompletada.cliente.ciudad || ordenCompletada.cliente.codigoPostal) && (
              <div className="order-shipping-summary">
                <h4>Datos de entrega</h4>
                <p>
                  {[ordenCompletada.cliente.direccion, ordenCompletada.cliente.ciudad, ordenCompletada.cliente.codigoPostal]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            <h4 className="order-items-title">Detalle de Productos:</h4>
            <div className="order-items-list">
              {ordenCompletada.items.map((item) => (
                <div key={item.id} className="order-item-row">
                  <div className="order-item-info">
                    <img
                      src={item.thumbnail || (item.images && item.images[0])}
                      alt={item.title}
                      className="order-item-img"
                    />
                    <div>
                      <strong>{item.title}</strong>
                      <span>Cantidad: {item.quantity || item.cantidad}</span>
                    </div>
                  </div>
                  <strong className="order-item-subtotal">
                    {formatoMoneda.format((item.price ?? item.precio) * (item.quantity || item.cantidad))}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-total-row">
              <span>Total de referencia:</span>
              <strong>{formatoMoneda.format(ordenCompletada.total)}</strong>
            </div>
          </div>

          <div className="checkout-success-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleVolverTienda}
            >
              Volver a la Tienda 🏠
            </button>
            <Link to="/productos" className="btn btn-secondary">
              Seguir Explorando
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Formulario de Checkout
  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <span className="checkout-eyebrow">Paso Final</span>
          <h1>Datos para tu pedido</h1>
        </header>

        <div className="checkout-grid">
          {/* Formulario de Envío */}
          <section className="checkout-form-section">
            <form onSubmit={handleConfirmarPedido} className="checkout-form">
              <div className="form-block">
                <h3>1. Información de Contacto</h3>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre completo (opcional)</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Correo electrónico (opcional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="tuemail@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono de contacto (opcional)</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    placeholder="+54 11 1234-5678"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-block">
                <h3>2. Dirección de Entrega</h3>
                <div className="form-group">
                  <label htmlFor="direccion">Calle y altura / piso (opcional)</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Ej: Av. Corrientes 1234, Piso 4 B"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad / localidad (opcional)</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      placeholder="Ej: Rosario"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigoPostal">Código postal (opcional)</label>
                    <input
                      type="text"
                      id="codigoPostal"
                      name="codigoPostal"
                      placeholder="Ej: S2000"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-submit-order"
                disabled={procesando}
              >
                {procesando ? "Registrando simulación..." : `Simular pedido · ${formatoMoneda.format(totalFinal)}`}
              </button>
            </form>
          </section>

          {/* Resumen Lateral */}
          <aside className="checkout-summary-section">
            <h3>Tu Pedido ({totalItems})</h3>
            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-item-preview">
                    <img
                      src={item.thumbnail || (item.images && item.images[0])}
                      alt={item.title}
                    />
                    <div>
                      <strong>{item.title}</strong>
                      <span>Cant: {item.quantity || item.cantidad}</span>
                    </div>
                  </div>
                  <span>{formatoMoneda.format((item.price ?? item.precio) * (item.quantity || item.cantidad))}</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-totals">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatoMoneda.format(totalPrice)}</span>
              </div>
              <div className="summary-line">
                <span>Envío</span>
                {costoEnvio === 0 ? <span className="shipping-free">Sin cargo</span> : formatoMoneda.format(costoEnvio)}
              </div>
              <div className="summary-line summary-line--total">
                <span>Total a pagar</span>
                <strong>{formatoMoneda.format(totalFinal)}</strong>
              </div>
            </div>

            <div className="checkout-guarantee">
              <span>Pedido de prueba · sin pago ni envío reales</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
