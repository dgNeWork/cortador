import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Booking from "./pages/Booking";
import Home from "./pages/Home";

// Mapa de rutas de la app. Hay dos "marcos":
// - PublicLayout (cabecera y pie de la web): home, reservar y el login
//   del cortador.
// - AdminLayout (barra del panel), dentro de ProtectedRoute: solo se
//   puede entrar con la sesión iniciada.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/reservar" element={<Booking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
