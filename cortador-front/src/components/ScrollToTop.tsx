import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router cambia de página sin recargar, y el navegador conserva el
// scroll de la página anterior: sin esto, al pulsar "Reservar ahora" al
// final de la home, /reservar se abría a mitad del formulario. Cada vez
// que cambia la ruta, volvemos arriba del todo.
// Si el enlace lleva un ancla (por ejemplo "/#galeria"), no hacemos nada:
// esa página ya se encarga de bajar hasta la sección indicada.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
