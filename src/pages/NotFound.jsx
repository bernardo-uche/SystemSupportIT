import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-ink-50 text-center px-4">
      <p className="text-5xl font-semibold text-ink-900">404</p>
      <p className="text-ink-400">Esta página no existe.</p>
      <Link to="/dashboard" className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700">
        Volver al panel
      </Link>
    </div>
  );
}