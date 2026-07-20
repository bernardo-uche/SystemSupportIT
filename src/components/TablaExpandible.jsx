import { useState } from "react";

export default function TablaExpandible({ items, obtenerId, renderResumen, renderDetalle }) {
  const [expandido, setExpandido] = useState(null);

  function alternar(id) {
    setExpandido((actual) => (actual === id ? null : id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const id = obtenerId(item);
        const abierto = expandido === id;

        return (
          <div key={id} className="overflow-hidden rounded-xl border border-ink-100 bg-white">
            <button
              onClick={() => alternar(id)}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              {renderResumen(item)}
              <span
                className={`text-ink-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>

            {abierto && (
              <div className="border-t border-ink-100 bg-ink-50 px-4 py-3">
                {renderDetalle(item)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}