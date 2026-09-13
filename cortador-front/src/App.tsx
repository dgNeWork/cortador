import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Booking from "./pages/Booking";
import Home from "./pages/Home";

// Estructura general de la app: cabecera y pie fijos, y en medio la
// página que corresponda según la URL (home o formulario de reserva).
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservar" element={<Booking />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
