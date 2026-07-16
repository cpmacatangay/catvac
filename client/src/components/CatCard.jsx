import { StatusPill } from './StatusPill.jsx'

export function CatCard({ cat, vaccines, onClick }) {
  const sorted = [...(vaccines || [])].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow text-left w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
          {cat.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-heading text-lg text-gray-800">{cat.name}</h3>
          {cat.breed && <p className="text-xs text-gray-400">{cat.breed}</p>}
        </div>
      </div>

      <div className="space-y-1">
        {sorted.slice(0, 5).map((v) => (
          <div key={v._id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{v.name}</span>
            <StatusPill status={v.status} dueDate={v.dueDate} />
          </div>
        ))}
        {sorted.length > 5 && (
          <p className="text-xs text-gray-400">+{sorted.length - 5} more</p>
        )}
      </div>
    </button>
  )
}
