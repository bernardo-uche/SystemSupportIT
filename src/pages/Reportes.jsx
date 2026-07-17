export default function Reportes() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">
        Reportes
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Visible para administrador y supervisor. Aquí irán los gráficos una
        vez que el backend entregue los endpoints de datos.
      </p>

      <div className="mt-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-ink-100 bg-white text-sm text-ink-400">
        Espacio reservado para gráficos (ej. con Recharts o Chart.js)
      </div>
    </div>
  );
}