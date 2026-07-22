export default function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}