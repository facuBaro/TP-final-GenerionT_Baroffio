/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, useContext } from "react";
import { CartContext, CarContext } from "./CartContext.js";

const CART_STORAGE_KEY = "generion_cart_v1";

function obtenerCarritoInicial() {
  try {
    const dataGuardada = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!dataGuardada) return [];
    const items = JSON.parse(dataGuardada);
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item) => item && item.id !== undefined && item.title && item.price >= 0 && item.quantity > 0
    );
  } catch (err) {
    console.error("Error al cargar carrito desde localStorage:", err);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(obtenerCarritoInicial);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  // Sincronizar con localStorage en cada cambio
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Error al guardar carrito en localStorage:", err);
    }
  }, [cart]);

  // Toast helpers con useCallback
  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Agregar al carrito con useCallback
  const addToCart = useCallback((product, quantityToAdd = 1) => {
    if (!product || quantityToAdd <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      const stockDisponible = product.stock ?? 999;

      if (existingIndex > -1) {
        const itemActual = prevCart[existingIndex];
        const nuevaCantidad = Math.min(itemActual.quantity + quantityToAdd, stockDisponible);

        const nuevoCarrito = [...prevCart];
        nuevoCarrito[existingIndex] = {
          ...itemActual,
          quantity: nuevaCantidad,
        };
        return nuevoCarrito;
      } else {
        const cantidadSegura = Math.min(quantityToAdd, stockDisponible);
        const nuevoItem = {
          id: product.id,
          title: product.title || product.nombre,
          price: product.price ?? product.precio,
          discountPercentage: product.discountPercentage || 0,
          thumbnail: product.thumbnail || (product.images && product.images[0]) || (product.imagen && product.imagen[0]),
          category: product.category,
          stock: stockDisponible,
          quantity: cantidadSegura,
        };
        return [...prevCart, nuevoItem];
      }
    });

    showToast(`¡${product.title || product.nombre || "Producto"} agregado al carrito!`, "success");
  }, [showToast]);

  // Actualizar cantidad directa con useCallback
  const updateQuantity = useCallback((productId, nuevaCantidad) => {
    setCart((prevCart) => {
      if (nuevaCantidad <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock ?? 999;
          return { ...item, quantity: Math.min(nuevaCantidad, maxStock) };
        }
        return item;
      });
    });
  }, []);

  // Compatibilidad con la función changeCartQuantity anterior
  const changeCartQuantity = useCallback((product, cambio) => {
    if (!product) return;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      const cantActual = existing ? (existing.quantity || existing.cantidad || 0) : 0;
      const nueva = cantActual + cambio;

      if (nueva <= 0) {
        return prevCart.filter((item) => item.id !== product.id);
      }

      const stockDisponible = product.stock ?? 999;
      const finalCant = Math.min(nueva, stockDisponible);

      if (!existing) {
        return [
          ...prevCart,
          {
            id: product.id,
            title: product.title || product.nombre,
            price: product.price ?? product.precio,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || (product.imagen && product.imagen[0]),
            category: product.category,
            stock: stockDisponible,
            quantity: finalCant,
          },
        ];
      }

      return prevCart.map((item) =>
        item.id === product.id ? { ...item, quantity: finalCant } : item
      );
    });
  }, []);

  // Eliminar producto con useCallback
  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    showToast("Producto eliminado del carrito", "info");
  }, [showToast]);

  // Vaciar carrito con useCallback
  const clearCart = useCallback(() => {
    setCart([]);
    showToast("El carrito ha sido vaciado", "info");
  }, [showToast]);

  // Totales calculados
  const totalItems = cart.reduce((total, item) => total + (item.quantity || item.cantidad || 0), 0);
  const totalPrice = cart.reduce((total, item) => {
    const cant = item.quantity || item.cantidad || 0;
    const precio = item.price ?? item.precio ?? 0;
    return total + precio * cant;
  }, 0);

  const value = {
    cart,
    addToCart,
    updateQuantity,
    changeCartQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    toast,
    showToast,
    hideToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook personalizado para usar el contexto con useContext
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}

export { CartContext, CarContext };
export default CartProvider;