import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Reportes from "./pages/Reportes.jsx";
import NotFound from "./pages/NotFound.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Clientes from "./pages/Clientes/Clientes.jsx";
import Repuestos from "./pages/Respuestos.jsx";
import Ventas from "./pages/Ventas.jsx";
import Proveedores from "./pages/Proveedores.jsx";
import OrdenesServicio from "./pages/OrdenesServicio/OrdenesServicio.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="repuestos" element={<Repuestos />} />
        <Route path="ordenes" element={<OrdenesServicio />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute rolesPermitidos={["administrador"]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute rolesPermitidos={["administrador", "supervisor"]}>
              <Reportes />
            </ProtectedRoute>
          }
        />
      </Route>
      

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}