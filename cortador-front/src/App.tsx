import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHamTypes from "./pages/admin/AdminHamTypes";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminLogin from "./pages/admin/AdminLogin";
import Booking from "./pages/Booking";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Mapa de rutas de la app. Hay dos "marcos":
// - PublicLayout (cabecera y pie de la web): home, reservar y el login
//   del cortador.
// - AdminLayout (barra del panel), dentro de ProtectedRoute: solo se
//   puede entrar con la sesión iniciada.
// La ruta "*" recoge cualquier dirección que no exista (página 404).
// ScrollToTop va fuera de las rutas porque vale para todas las páginas.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/calendario" element={<AdminCalendar />} />
            <Route path="/admin/jamones" element={<AdminHamTypes />} />
            <Route path="/admin/tarifas" element={<AdminPricing />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
