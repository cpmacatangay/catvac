const STATUS_CONFIG = {
  'on-track': { bg: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500', label: 'On track' },
  upcoming: { bg: 'bg-blue-100 text-blue-700 border border-blue-200', dot: 'bg-blue-500', label: 'Upcoming' },
  due: { bg: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'Due' },
  overdue: { bg: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500', label: 'Overdue' },
  administered: { bg: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500', label: 'Done' },
  snoozed: { bg: 'bg-purple-100 text-purple-700 border border-purple-200', dot: 'bg-purple-500', label: 'Snoozed' },
}

export function StatusPill({ status, dueDate }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['on-track']

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-badge font-bold uppercase tracking-wider ${config.bg}`}
      aria-label={`Status: ${config.label}${dueDate ? `, due ${new Date(dueDate).toLocaleDateString()}` : ''}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}
