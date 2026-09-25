import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Marco de la web pública: cabecera y pie fijos, y en medio la página
// que corresponda según la URL (Outlet).
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
