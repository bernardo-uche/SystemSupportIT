# 📄 INFORME DE AVANCE Y ESTADO DEL PROYECTO - SYSTEMSUPPORTIT

> **Instrucción para futuras IAs**: Lee este archivo al iniciar una nueva sesión para conocer el estado exacto del proyecto, su estructura, servicios y funcionalidades implementadas.

---

## 📌 1. Resumen General del Proyecto

- **Nombre del Proyecto**: SystemSupportIT
- **Repositorio GitHub**: `https://github.com/bernardo-uche/SystemSupportIT`
- **Estado Actual**: 100% Funcional en entorno local con datos interactivos y persistencia en `localStorage`.
- **Modo de Funcionamiento**: `VITE_USE_MOCK=true` (Configurado en `.env`). Preparado para conexión inmediata con el backend PHP/MySQL (`VITE_USE_MOCK=false`).
- **Compilación**: Verificada con `npm run build` (**105 módulos transformados sin errores ni advertencias**).

---

## 🏗️ 2. Arquitectura y Estándares Desarrollados

### A. Estandarización de Formularios Emergentes (`<Modal>`)
Todos los formularios del sistema (alta, edición, presupuestos, auditorías, reportes) se despliegan en **ventanas emergentes flotantes (`Modal.jsx`)** centradas con fondo difuminado y botón de cierre (`✕`), manteniendo una interfaz homogénea y profesional.

### B. Persistencia de Datos Local (`localStorage`)
Todos los servicios en `src/services/` almacenan y actualizan dinámicamente los registros en el almacenamiento local del navegador (`localStorage`). **Ningún dato se pierde al recargar la página (F5)**.

### C. Normalización y Seguridad de Datos
Todos los servicios cuentan con mapeos seguros para evitar fallos por sub-objetos anidados o diferencias de nombre en los archivos JSON de prueba (ej. `of_nombre` vs `nombre`, `porcentaje` vs `descuento_porcentaje`).

---

## 📦 3. Módulos Implementados y Funcionalidades

### 🟢 Módulo 1: Servicio Técnico y Personal
- **Clientes** (`src/pages/modulo1/Clientes.jsx`): Registro y edición en `Modal` con nombre, NIT/CI, teléfono, dirección y selector de **Estado** (*Activo / Inactivo*).
- **Personal** (`src/pages/modulo1/Personal.jsx`): Registro de personal técnico y administrativo en `Modal` con cargo, correo, teléfono y selector de **Estado**.
- **Equipos** (`src/pages/modulo1/Equipos.jsx`): Registro de equipos de clientes en `Modal` con N° de serie, marca, modelo, color y **Estado**.
- **Órdenes de Servicio** (`src/pages/modulo1/OrdenesServicio.jsx`): Registro de órdenes en `Modal` vinculando cliente, técnico asignado, problema reportado, costo estimado, fecha de entrega y estado (*Pendiente, En proceso, Finalizada*).

### 🟢 Módulo 2: Compras y Proveedores
- **Proveedores** (`src/pages/modulo2/Proveedores.jsx`): Registro y edición de proveedores en `Modal` con NIT, departamento, contacto y **Estado**.
- **Compras** (`src/pages/modulo2/Compras.jsx`): Registro de compras en `Modal` con detalle dinámico de repuestos, cálculo de total en tiempo real y opción de anulación.
- **Ofertas** (`src/pages/modulo2/Ofertas.jsx`): Promociones temporales en `Modal` con porcentaje de descuento, fechas de vigencia y selector de **Estado** (*Vigente / Inactivo*).
- **Cotizaciones** (`src/pages/modulo2/Cotizaciones.jsx`): Elaboración de presupuestos en `Modal` vinculados a clientes u órdenes, con aplicación de ofertas y cálculo automático de total final.

### 🟢 Módulo 3: Ventas y Repuestos
- **Repuestos** (`src/pages/modulo3/Respuestos.jsx`): Catálogo de componentes con alertas de stock bajo y formulario `Modal` para registro de nuevas piezas.
- **Ventas** (`src/pages/modulo3/Ventas.jsx`): Registro de ventas directas en `Modal` con detalle de ítems, precio unitario, vendedor y método de pago (*Efectivo, Transferencia, QR, Tarjeta*).

### 🟢 Módulo 4: Control de Inventario y Almacén
- **Inventario** (`src/pages/modulo4/Inventario.jsx`): Control de stock disponible y formulario `Modal` para ajustar ubicación física en almacén y niveles mín/máx.
- **Lote de Stock** (`src/pages/modulo4/LoteStock.jsx`): Seguimiento e historial de lotes por proveedor.
- **Kardex** (`src/pages/modulo4/Kardex.jsx`): Registro de movimientos de entrada y salida de almacén.
- **Inventario Físico** (`src/pages/modulo4/InventarioFisico.jsx`): Registro de auditorías de conteo físico en `Modal`.

### 🟢 Módulo 5: Mantenimiento Técnico
- **Herramientas** (`src/pages/modulo5/Herramientas.jsx`): Control de herramientas de taller con ajuste de estado físico (*Excelente, Bueno, Regular, Malo*) en `Modal`.
- **Mantenimientos** (`src/pages/modulo5/Mantenimientos.jsx`): Catálogo de tipos de mantenimiento en `Modal` con tarifas base, tiempos estimados y **Estado del servicio**.
- **Trabajos de Mantenimiento** (`src/pages/modulo5/TrabajosMantenimiento.jsx`): Programación y asignación de órdenes de mantenimiento en `Modal`.

### 🟢 Módulo de Administración y Reportes
- **Usuarios** (`src/pages/Usuarios.jsx`): Registro de cuentas en `Modal` con nombre, correo, contraseña, roles (*administrador, supervisor, personal*) y selector de **Estado** (*Activo / Inactivo*).
- **Reportes** (`src/pages/Reportes.jsx`): Generador ejecutivo de informes en `Modal` por rango de fechas, tipo de reporte, formato (*PDF, Excel, CSV*) e historial con botón de descarga.

---

## 🛠️ 4. Guía de Archivos Clave para la IA

Si en la siguiente sesión necesitas modificar o conectar una API:

1. **Variables de Entorno**: `.env` (`VITE_USE_MOCK`, `VITE_API_URL`).
2. **Servicios Centrales**: `src/services/` (Contiene todos los handlers de datos).
3. **Navegación y Menú**: `src/layouts/DashboardLayout.jsx` (Listado de ítems de menú con sus permisos de rol).
4. **Rutas del Sistema**: `src/App.jsx` (Todas las rutas activas).
5. **Componente Modal**: `src/components/Modal.jsx`.

---

## ✅ 5. Estado de Compilación
```bash
npm run build
# vite v8.1.4 building client environment for production...
# transforming...✓ 105 modules transformed.
# dist/assets/index-ij6yWNu2.js 430.80 kB
# ✓ built in 441ms
```
