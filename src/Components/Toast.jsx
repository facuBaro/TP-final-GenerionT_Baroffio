import { useEffect } from "react";
import { useCart } from "../context/useCart.js";
import "./Toast.css";

export default function Toast() {
  const { toast, hideToast } = useCart();

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast.visible, hideToast]);

  if (!toast.visible) return null;

  return (
    <div className={`toast-notification toast-${toast.type}`} role="alert" aria-live="assertive">
      <div className="toast-icon">
        {toast.type === "success" && "✓"}
        {toast.type === "info" && "ℹ"}
        {toast.type === "error" && "✕"}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button
        type="button"
        className="toast-close"
        onClick={hideToast}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
