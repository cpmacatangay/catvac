import { StatusPill } from './StatusPill.jsx'
import { useAdministerVaccine, useSnoozeVaccine, useDeleteVaccine } from '../hooks/useVaccines.js'

export function VaccineRow({ vaccine }) {
  const administer = useAdministerVaccine()
  const snooze = useSnoozeVaccine()
  const remove = useDeleteVaccine()

  return (
    <div className="bg-white rounded-lg p-4 shadow-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-semibold text-gray-800">{vaccine.name}</p>
          <p className="text-xs text-gray-400">
            Due: {new Date(vaccine.dueDate).toLocaleDateString()}
            {vaccine.intervalMonths && ` · Every ${vaccine.intervalMonths}mo`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill status={vaccine.status} dueDate={vaccine.dueDate} />

        {!vaccine.administered && (
          <>
            <button
              onClick={() => administer.mutate({ id: vaccine._id })}
              className="text-xs text-green-600 hover:text-green-700 px-2 py-1"
              title="Mark administered"
            >
              ✓
            </button>
            <button
              onClick={() => snooze.mutate({ id: vaccine._id, days: 30 })}
              className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1"
              title="Snooze 30 days"
            >
              ↻
            </button>
          </>
        )}

        <button
          onClick={() => remove.mutate(vaccine._id)}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
