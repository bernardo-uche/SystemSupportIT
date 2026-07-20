import { useLocation } from "react-router-dom";

export default function EnConstruccion() {
  const location = useLocation();
  const nombreModulo = location.state?.nombre || "Este módulo";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
        🚧
      </div>
      <h1 className="mt-4 text-xl font-semibold text-ink-900">
        Módulo {nombreModulo}, se encuentra en mantenimiento.
    </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-400">
        El equipo de desarrollo está trabajando para habilitar este módulo lo antes posible. Gracias por su paciencia.
      </p>
    </div>
  );
}