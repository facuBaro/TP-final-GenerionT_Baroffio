import { useState, useEffect, useCallback } from "react";
import { NOMBRES_CATEGORIAS } from "../utils/categories.js";
import "./FiltroYOrden.css";

export default function FiltroYOrden({
  categoriaSeleccionada,
  onCategoriaChange,
  ordenSeleccionado,
  onOrdenChange,
  precioMin,
  onPrecioMinChange,
  precioMax,
  onPrecioMaxChange,
  soloConStock,
  onSoloConStockChange,
  terminoBusqueda,
  onTerminoBusquedaChange,
  onLimpiarFiltros,
  totalResultados,
}) {
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  // Carga asíncrona de categorías con async y fetch
  useEffect(() => {
    let montado = true;
    const cargarCategorias = async () => {
      try {
        const res = await fetch("https://dummyjson.com/products/categories");
        if (!res.ok) throw new Error("Error al obtener categorías");
        const data = await res.json();
        if (montado && Array.isArray(data)) {
          setCategorias(
            data.map((cat) =>
              typeof cat === "string" ? { slug: cat, name: cat } : cat
            )
          );
        }
      } catch (err) {
        console.error("No se pudieron cargar las categorías:", err);
      } finally {
        if (montado) setCargandoCategorias(false);
      }
    };

    cargarCategorias();
    return () => {
      montado = false;
    };
  }, []);

  // Handlers con useCallback
  const handleSelectCategoria = useCallback(
    (e) => {
      onCategoriaChange(e.target.value);
    },
    [onCategoriaChange]
  );

  const handleSelectOrden = useCallback(
    (e) => {
      onOrdenChange(e.target.value);
    },
    [onOrdenChange]
  );

  const handleMinChange = useCallback(
    (e) => {
      onPrecioMinChange(e.target.value);
    },
    [onPrecioMinChange]
  );

  const handleMaxChange = useCallback(
    (e) => {
      onPrecioMaxChange(e.target.value);
    },
    [onPrecioMaxChange]
  );

  const handleStockToggle = useCallback(
    (e) => {
      onSoloConStockChange(e.target.checked);
    },
    [onSoloConStockChange]
  );

  const hayFiltrosActivos =
    Boolean(categoriaSeleccionada) ||
    Boolean(precioMin) ||
    Boolean(precioMax) ||
    Boolean(soloConStock) ||
    Boolean(terminoBusqueda);

  return (
    <div className="filter-toolbar">
      <div className="filter-toolbar__top">
        {/* Contador de resultados */}
        <div className="filter-toolbar__count">
          <span>Mostrando <strong>{totalResultados}</strong> productos</span>
          {terminoBusqueda && (
            <span className="filter-toolbar__search-tag">
              para &quot;{terminoBusqueda}&quot;
              <button
                type="button"
                onClick={() => onTerminoBusquedaChange("")}
                title="Quitar búsqueda"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {/* Botón de limpiar filtros */}
        {hayFiltrosActivos && (
          <button
            type="button"
            className="filter-toolbar__btn-reset"
            onClick={onLimpiarFiltros}
          >
            ↺ Limpiar Filtros
          </button>
        )}
      </div>

      <div className="filter-toolbar__controls">
        {/* Filtro por Categoría */}
        <div className="filter-group">
          <label htmlFor="filter-category" className="filter-label">
            Categoría:
          </label>
          <select
            id="filter-category"
            className="filter-select"
            value={categoriaSeleccionada}
            onChange={handleSelectCategoria}
            disabled={cargandoCategorias}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {NOMBRES_CATEGORIAS[cat.slug] || (cat.name.charAt(0).toUpperCase() + cat.name.slice(1))}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Rango de Precios */}
        <div className="filter-group filter-group--prices">
          <span className="filter-label">Precio (USD):</span>
          <div className="filter-price-inputs">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={precioMin}
              onChange={handleMinChange}
              className="filter-input-number"
            />
            <span className="filter-price-separator">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={precioMax}
              onChange={handleMaxChange}
              className="filter-input-number"
            />
          </div>
        </div>

        {/* Filtro Solo con Stock */}
        <div className="filter-group filter-group--checkbox">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={soloConStock}
              onChange={handleStockToggle}
              className="filter-checkbox"
            />
            <span>Solo en stock</span>
          </label>
        </div>

        {/* Ordenar por */}
        <div className="filter-group filter-group--sort">
          <label htmlFor="filter-sort" className="filter-label">
            Ordenar por:
          </label>
          <select
            id="filter-sort"
            className="filter-select"
            value={ordenSeleccionado}
            onChange={handleSelectOrden}
          >
            <option value="destacados">Destacados / Popularidad</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor Valorados (Rating)</option>
            <option value="descuento">Mayor Descuento</option>
            <option value="nombre-asc">Nombre: A - Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}