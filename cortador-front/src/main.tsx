import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider";

// Punto de entrada de la app: monta App dentro del router para que
// funcionen las distintas páginas, y dentro del AuthProvider para que
// cualquier página pueda saber si el cortador ha iniciado sesión.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
