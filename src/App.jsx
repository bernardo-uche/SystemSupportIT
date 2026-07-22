import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Reportes from "./pages/Reportes.jsx";
import NotFound from "./pages/NotFound.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { Clientes, OrdenesServicio, Personal, Equipos } from "./pages/modulo1";
import { Compras, Proveedores, Ofertas, Cotizaciones } from "./pages/modulo2";
import { Repuestos, Ventas } from "./pages/modulo3";
import { Inventario, LoteStock, Kardex, InventarioFisico } from "./pages/modulo4";
import { Herramientas, Mantenimientos, TrabajosMantenimiento } from "./pages/modulo5";
import EnConstruccion from "./pages/EnConstruccion.jsx";

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
        <Route path="compras" element={<Compras />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
        <Route path="ordenes" element={<OrdenesServicio />} />
        <Route path="personal" element={<Personal />} />
        <Route path="equipos" element={<Equipos />} />

        {/* Módulo 4: Inventario */}
        <Route path="inventario" element={<Inventario />} />
        <Route path="lote-stock" element={<LoteStock />} />
        <Route path="kardex" element={<Kardex />} />
        <Route path="inventario-fisico" element={<InventarioFisico />} />

        {/* Módulo 5: Mantenimiento */}
        <Route path="herramientas" element={<Herramientas />} />
        <Route path="mantenimientos" element={<Mantenimientos />} />
        <Route path="trabajos" element={<TrabajosMantenimiento />} />

        <Route path="proximamente" element={<EnConstruccion />} />
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