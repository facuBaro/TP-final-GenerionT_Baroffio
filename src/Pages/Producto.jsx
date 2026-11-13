import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { NOMBRES_CATEGORIAS } from "../utils/categories.js";
import "./Producto.css";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

function traducirGarantia(texto) {
  if (!texto) return "Sin información de garantía";
  if (/^lifetime warranty$/i.test(texto)) return "Garantía de por vida";
  if (/^no warranty$/i.test(texto)) return "Sin garantía informada";

  const coincidencia = texto.match(/^(\d+)\s+(month|week|year)s?\s+warranty$/i);
  if (!coincidencia) return "Información de garantía disponible";

  const [, cantidad, unidad] = coincidencia;
  const unidades = {
    month: Number(cantidad) === 1 ? "mes" : "meses",
    week: Number(cantidad) === 1 ? "semana" : "semanas",
    year: Number(cantidad) === 1 ? "año" : "años",
  };
  return `Garantía de ${cantidad} ${unidades[unidad.toLowerCase()]}`;
}

function traducirEnvio(texto) {
  if (!texto) return "Información de envío no disponible";
  if (/^ships overnight$/i.test(texto)) return "Envío al día siguiente";

  const coincidencia = texto.match(
    /^Ships in (\d+)(?:-(\d+))? (business )?(days?|weeks?|months?)$/i
  );
  if (!coincidencia) return "Información de envío disponible";

  const [, desde, hasta, habil, unidad] = coincidencia;
  const unidadBase = unidad.toLowerCase().replace(/s$/, "");
  const nombres = {
    day: Number(desde) === 1 && !hasta ? "día" : "días",
    week: Number(desde) === 1 && !hasta ? "semana" : "semanas",
    month: Number(desde) === 1 && !hasta ? "mes" : "meses",
  };
  const rango = hasta ? `${desde} a ${hasta}` : desde;
  const diasHabiles = habil ? " hábiles" : "";
  return `Envío en ${rango} ${nombres[unidadBase]}${diasHabiles}`;
}

function traducirDevolucion(texto) {
  if (!texto) return "Sin información de devoluciones";
  if (/^no return policy$/i.test(texto)) return "No se aceptan devoluciones";

  const coincidencia = texto.match(/^(\d+)\s+days return policy$/i);
  if (!coincidencia) return "Información de devoluciones disponible";
  return `Devolución dentro de ${coincidencia[1]} días`;
}

export default function Producto() {
  const { id } = useParams(); // useParams obligatorio
  const navigate = useNavigate(); // useNavigate obligatorio
  const location = useLocation();
  const volverA = location.state?.from || "/productos";
  const { addToCart, cart } = useCart(); // useContext obligatorio

  // Estados locales con useState
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [tabActiva, setTabActiva] = useState("detalles"); // 'detalles' | 'resenas'

  // useRef para la imagen principal de la galería
  const imagenPrincipalRef = useRef(null);

  // Carga asíncrona con useEffect, async y fetch
  useEffect(() => {
    let montado = true;
    const cargarDetalleProducto = async () => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(`https://dummyjson.com/products/${id}`);
        if (!respuesta.ok) {
          throw new Error("No se pudo encontrar el producto solicitado.");
        }
        const datos = await respuesta.json();
        if (montado) {
          setProducto(datos);
          setImagenSeleccionada(0);
          setCantidad(1);
        }
      } catch (err) {
        console.error("Error al cargar producto:", err);
        if (montado) {
          setError(err.message || "Error al obtener la información.");
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarDetalleProducto();

    return () => {
      montado = false;
    };
  }, [id]);

  // Cantidad actual en carrito
  const itemEnCarrito = cart.find((item) => item.id === Number(id));
  const cantidadEnCarrito = itemEnCarrito ? (itemEnCarrito.quantity || itemEnCarrito.cantidad || 0) : 0;
  const stockDisponible = producto ? producto.stock : 0;
  const stockRestante = Math.max(0, stockDisponible - cantidadEnCarrito);

  // Manejo de cambio de cantidad con useCallback
  const cambiarCantidad = useCallback(
    (delta) => {
      setCantidad((prev) => {
        const nuevo = prev + delta;
        if (nuevo < 1) return 1;
        if (nuevo > stockRestante) return stockRestante > 0 ? stockRestante : 1;
        return nuevo;
      });
    },
    [stockRestante]
  );

  // Agregar al carrito con useCallback
  const handleAgregarAlCarrito = useCallback(() => {
    if (!producto || stockRestante <= 0) return;
    addToCart(producto, cantidad);
  }, [addToCart, producto, cantidad, stockRestante]);

  // Comprar ahora y navegar directo al carrito con useNavigate y useCallback
  const handleComprarAhora = useCallback(() => {
    if (!producto || stockRestante <= 0) return;
    addToCart(producto, cantidad);
    navigate("/carrito");
  }, [addToCart, producto, cantidad, stockRestante, navigate]);

  // Selección de imagen con foco/animación en useRef
  const handleSeleccionarImagen = useCallback((index) => {
    setImagenSeleccionada(index);
    if (imagenPrincipalRef.current) {
      imagenPrincipalRef.current.style.opacity = "0.7";
      setTimeout(() => {
        if (imagenPrincipalRef.current) {
          imagenPrincipalRef.current.style.opacity = "1";
        }
      }, 150);
    }
  }, []);

  // Estados de carga y error
  if (cargando) {
    return (
      <main className="producto-detalle-page">
        <div className="producto-detalle-skeleton">
          <div className="skeleton-gallery"></div>
          <div className="skeleton-info"></div>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="producto-detalle-page">
        <div className="producto-error-box">
          <span className="error-icon">⚠️</span>
          <h2>Producto no disponible</h2>
          <p>{error || "No pudimos encontrar los datos de este producto."}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(volverA)}
          >
            ← Volver al Catálogo
          </button>
        </div>
      </main>
    );
  }

  const imagenes = (producto.images && producto.images.length > 0
    ? producto.images
    : [producto.thumbnail]
  ).filter(Boolean);

  const tieneDescuento = producto.discountPercentage > 5;
  const precioOriginal = tieneDescuento
    ? producto.price / (1 - producto.discountPercentage / 100)
    : null;
  const nombreCategoria = NOMBRES_CATEGORIAS[producto.category] || producto.category;

  return (
    <main className="producto-detalle-page">
      <div className="producto-detalle-container">
        <button
          type="button"
          className="btn btn-secondary producto-volver"
          onClick={() => navigate(volverA)}
        >
          ← Volver
        </button>
        {/* Breadcrumb de navegación */}
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/productos">Catálogo</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/productos?category=${producto.category}`}>
            {nombreCategoria}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{producto.title}</span>
        </nav>

        {/* Card Principal de Detalle */}
        <div className="producto-grid">
          {/* Galería de Imágenes */}
          <div className="producto-galeria-box">
            <div className="producto-imagen-grande-wrapper">
              <img
                ref={imagenPrincipalRef}
                src={imagenes[imagenSeleccionada]}
                alt={producto.title}
                className="producto-imagen-grande"
              />
              {tieneDescuento && (
                <span className="producto-badge-descuento">
                  -{Math.round(producto.discountPercentage)}% OFF
                </span>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="producto-miniaturas">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`miniatura-btn ${idx === imagenSeleccionada ? "activa" : ""}`}
                    onClick={() => handleSeleccionarImagen(idx)}
                    aria-label={`Ver imagen ${idx + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información y Compra */}
          <div className="producto-info-box">
            <div className="producto-header-meta">
              <span className="producto-categoria-tag">{nombreCategoria}</span>
              {producto.brand && <span className="producto-brand-tag">{producto.brand}</span>}
              <div className="producto-rating">
                <span className="star-icon">★</span>
                <strong>{producto.rating}</strong>
                <span className="reviews-count">({producto.reviews?.length || 0} opiniones)</span>
              </div>
            </div>

            <h1 className="producto-titulo">{producto.title}</h1>

            <div className="producto-precios">
              <span className="producto-precio-actual">
                {formatoMoneda.format(producto.price)}
              </span>
              {precioOriginal && (
                <span className="producto-precio-tachado">
                  {formatoMoneda.format(precioOriginal)}
                </span>
              )}
            </div>

            {/* Disponibilidad de Stock */}
            <div className="producto-stock-box">
              {stockDisponible > 0 ? (
                <span className="stock-disponible">
                  ✓ En stock ({stockDisponible} unidades disponibles)
                </span>
              ) : (
                <span className="stock-agotado">✕ Producto agotado</span>
              )}
              {cantidadEnCarrito > 0 && (
                <span className="en-carrito-aviso">
                  (Ya tenés {cantidadEnCarrito} en tu carrito)
                </span>
              )}
            </div>

            <p className="producto-descripcion-corta">{producto.description}</p>

            {/* Selector de cantidad y botones de compra */}
            {stockRestante > 0 ? (
              <div className="producto-acciones-compra">
                <div className="cantidad-selector">
                  <span className="cantidad-label">Cantidad:</span>
                  <div className="cantidad-controles">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(-1)}
                      disabled={cantidad <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="cantidad-valor">{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(1)}
                      disabled={cantidad >= stockRestante}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="producto-botones-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-comprar-ahora"
                    onClick={handleComprarAhora}
                  >
                    Comprar ahora
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-agregar-carrito"
                    onClick={handleAgregarAlCarrito}
                  >
                    Añadir al Carrito 🛒
                  </button>
                </div>
              </div>
            ) : (
              <div className="producto-sin-stock-aviso">
                <p>No hay más stock disponible para agregar.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/productos")}
                >
                  Explorar otros productos
                </button>
              </div>
            )}

            {/* Ventajas y Garantías */}
            <div className="producto-beneficios-lista">
              <div className="beneficio-item">
                <span>🚚</span>
                <div>
                  <strong>{traducirEnvio(producto.shippingInformation)}</strong>
                  <p>El plazo puede variar según la disponibilidad.</p>
                </div>
              </div>
              <div className="beneficio-item">
                <span>🛡️</span>
                <div>
                  <strong>{traducirGarantia(producto.warrantyInformation)}</strong>
                  <p>Revisá las condiciones antes de realizar tu compra.</p>
                </div>
              </div>
              <div className="beneficio-item">
                <span>🔄</span>
                <div>
                  <strong>{traducirDevolucion(producto.returnPolicy)}</strong>
                  <p>Las condiciones pueden variar según el producto.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Especificaciones y Reseñas */}
        <section className="producto-tabs-seccion">
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn ${tabActiva === "detalles" ? "activo" : ""}`}
              onClick={() => setTabActiva("detalles")}
            >
              Especificaciones Técnicas
            </button>
            <button
              type="button"
              className={`tab-btn ${tabActiva === "resenas" ? "activo" : ""}`}
              onClick={() => setTabActiva("resenas")}
            >
              Opiniones de Clientes ({producto.reviews?.length || 0})
            </button>
          </div>

          <div className="tab-contenido">
            {tabActiva === "detalles" && (
              <div className="specs-grid">
                <div className="spec-row">
                  <span className="spec-label">Marca</span>
                  <span className="spec-value">{producto.brand || "Sin marca informada"}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Código SKU</span>
                  <span className="spec-value">{producto.sku || `SKU-${producto.id}00`}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Categoría</span>
                  <span className="spec-value">{nombreCategoria}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Estado de disponibilidad</span>
                  <span className="spec-value">{producto.availabilityStatus || "En stock"}</span>
                </div>
                {producto.dimensions && (
                  <div className="spec-row">
                    <span className="spec-label">Dimensiones</span>
                    <span className="spec-value">
                      {producto.dimensions.width} x {producto.dimensions.height} x {producto.dimensions.depth} cm
                    </span>
                  </div>
                )}
                {producto.weight && (
                  <div className="spec-row">
                    <span className="spec-label">Peso</span>
                    <span className="spec-value">{producto.weight} kg</span>
                  </div>
                )}
              </div>
            )}

            {tabActiva === "resenas" && (
              <div className="resenas-lista">
                {producto.reviews && producto.reviews.length > 0 ? (
                  producto.reviews.map((rev, i) => (
                    <div key={i} className="resena-card">
                      <div className="resena-header">
                        <div className="resena-avatar">
                          {rev.reviewerName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <strong>{rev.reviewerName || "Comprador verificado"}</strong>
                          <span className="resena-fecha">
                            {new Date(rev.date).toLocaleDateString("es-AR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="resena-estrellas">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </div>
                      </div>
                      <p className="resena-comentario">&quot;{rev.comment}&quot;</p>
                    </div>
                  ))
                ) : (
                  <p className="sin-resenas">Aún no hay opiniones para este producto.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}