export function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-red-600 text-body-sm mt-1">{error}</p>}
    </div>
  )
}
