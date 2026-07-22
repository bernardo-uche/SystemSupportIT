export default function Campo({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}