import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>Página no encontrada</h1>
        <p>La sección o producto que estás buscando no existe o fue movido.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Volver a la Página Principal 🏠
        </button>
      </div>
    </main>
  );
}
