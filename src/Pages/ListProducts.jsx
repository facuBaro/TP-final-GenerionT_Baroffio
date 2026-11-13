import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductoCard from "../Components/ProductoCard.jsx";
import FiltroYOrden from "../Components/FiltroYOrden.jsx";
import { NOMBRES_CATEGORIAS, ALIASES_CATEGORIAS } from "../utils/categories.js";
import "./ListProducts.css";

export default function ListProducts() {
  const { categorySlug } = useParams(); // useParams obligatorio
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlCategory = categorySlug || searchParams.get("category") || "";
  const urlSearch = searchParams.get("q") || "";

  // Estados de productos y estado de carga
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recargarTrigger, setRecargarTrigger] = useState(0);

  // Filtros interactivos
  const [orden, setOrden] = useState("destacados");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);

  // useRef para scroll al catálogo al limpiar filtros
  const topCatalogRef = useRef(null);

  // Carga asíncrona de productos con async y fetch
  useEffect(() => {
    let cancelado = false;

    const ejecutarCarga = async () => {
      try {
        const respuesta = await fetch("https://dummyjson.com/products?limit=0");
        if (!respuesta.ok) {
          throw new Error("No se pudo conectar con el catálogo de productos.");
        }
        const datos = await respuesta.json();
        if (!cancelado) {
          const lista = Array.isArray(datos.products) ? datos.products : [];
          setProductos(lista);
          setError(null);
          setCargando(false);
        }
      } catch (err) {
        if (!cancelado) {
          console.error("Error al cargar productos:", err);
          setError(err.message || "Error al obtener los datos.");
          setCargando(false);
        }
      }
    };

    ejecutarCarga();

    return () => {
      cancelado = true;
    };
  }, [recargarTrigger]);

  // Reintentar carga manual con useCallback
  const handleReintentar = useCallback(() => {
    setCargando(true);
    setRecargarTrigger((prev) => prev + 1);
  }, []);

  // Limpiar todos los filtros con useCallback
  const handleLimpiarFiltros = useCallback(() => {
    setOrden("destacados");
    setPrecioMin("");
    setPrecioMax("");
    setSoloConStock(false);
    navigate("/productos");
    topCatalogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [navigate]);

  const handleCategoriaChange = useCallback((categoria) => {
    const parametros = new URLSearchParams(searchParams);
    if (categoria) parametros.set("category", categoria);
    else parametros.delete("category");
    const query = parametros.toString();
    navigate(`/productos${query ? `?${query}` : ""}`);
  }, [navigate, searchParams]);

  const handleBusquedaChange = useCallback((busqueda) => {
    const parametros = new URLSearchParams(searchParams);
    if (busqueda) parametros.set("q", busqueda);
    else parametros.delete("q");
    setSearchParams(parametros, { replace: true });
  }, [searchParams, setSearchParams]);

  // Filtrado y ordenamiento en memoria usando useMemo
  const categoriaActiva = urlCategory;
  const categoriaNormalizada = categoriaActiva
    ? (ALIASES_CATEGORIAS[categoriaActiva.toLowerCase()] || categoriaActiva.toLowerCase())
    : "";
  const busquedaActiva = urlSearch;

  const productosFiltradosYOrdenados = useMemo(() => {
    return productos
      .filter((prod) => {
        // Filtro por categoría (soporta tanto 'vehicle' como alias 'vehiculos')
        if (categoriaNormalizada && (prod.category || "").toLowerCase() !== categoriaNormalizada) {
          return false;
        }

        // Filtro por término de búsqueda (título, descripción, marca, etiquetas)
        if (busquedaActiva.trim()) {
          const q = busquedaActiva.toLowerCase();
          const matchTitle = prod.title?.toLowerCase().includes(q);
          const matchDesc = prod.description?.toLowerCase().includes(q);
          const matchBrand = prod.brand?.toLowerCase().includes(q);
          const matchTags = Array.isArray(prod.tags) && prod.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(q));

          if (!matchTitle && !matchDesc && !matchBrand && !matchTags) {
            return false;
          }
        }

        // Filtro por precio mínimo
        if (precioMin !== "" && !isNaN(Number(precioMin))) {
          if (prod.price < Number(precioMin)) return false;
        }

        // Filtro por precio máximo
        if (precioMax !== "" && !isNaN(Number(precioMax))) {
          if (prod.price > Number(precioMax)) return false;
        }

        // Filtro por stock
        if (soloConStock && prod.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (orden) {
          case "precio-asc":
            return a.price - b.price;
          case "precio-desc":
            return b.price - a.price;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "descuento":
            return (b.discountPercentage || 0) - (a.discountPercentage || 0);
          case "nombre-asc":
            return a.title.localeCompare(b.title);
          case "destacados":
          default:
            return 0; // Orden original de la API
        }
      });
  }, [productos, categoriaNormalizada, busquedaActiva, precioMin, precioMax, soloConStock, orden]);

  return (
    <main className="catalog-page" ref={topCatalogRef}>
      <header className="catalog-header">
        <div className="catalog-header__content">
          <span className="catalog-eyebrow">Catálogo Oficial</span>
          <h1>
            {categoriaNormalizada
              ? `Categoría: ${NOMBRES_CATEGORIAS[categoriaNormalizada] || categoriaNormalizada.toUpperCase()}`
              : busquedaActiva
              ? `Resultados para "${busquedaActiva}"`
              : "Todos los Productos"}
          </h1>
          <p>
            Explorá la selección de muestra y compará precios, categorías y descuentos.
          </p>
        </div>
      </header>

      <div className="catalog-container">
        {/* Barra de Filtros y Orden */}
        <FiltroYOrden
          categoriaSeleccionada={categoriaNormalizada}
          onCategoriaChange={handleCategoriaChange}
          ordenSeleccionado={orden}
          onOrdenChange={setOrden}
          precioMin={precioMin}
          onPrecioMinChange={setPrecioMin}
          precioMax={precioMax}
          onPrecioMaxChange={setPrecioMax}
          soloConStock={soloConStock}
          onSoloConStockChange={setSoloConStock}
          terminoBusqueda={busquedaActiva}
          onTerminoBusquedaChange={handleBusquedaChange}
          onLimpiarFiltros={handleLimpiarFiltros}
          totalResultados={productosFiltradosYOrdenados.length}
        />

        {/* Estado de Error */}
        {error && (
          <div className="catalog-status catalog-status--error" role="alert">
            <p>⚠️ {error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReintentar}
            >
              Reintentar Carga
            </button>
          </div>
        )}

        {/* Estado de Carga (Skeletons) */}
        {cargando && !error && (
          <div className="catalog-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="product-skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-line skeleton-line--short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-line--price"></div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Productos */}
        {!cargando && !error && productosFiltradosYOrdenados.length > 0 && (
          <div className="catalog-grid">
            {productosFiltradosYOrdenados.map((producto) => (
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

        {/* Sin Resultados */}
        {!cargando && !error && productosFiltradosYOrdenados.length === 0 && (
          <div className="catalog-empty">
            <span className="catalog-empty__icon">🔍</span>
            <h3>No encontramos productos que coincidan</h3>
            <p>
              Probá ajustando los filtros de precio o buscando con otro término.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLimpiarFiltros}
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>
    </main>
  );
}