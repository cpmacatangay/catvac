const STATUS_STYLES = {
  'on-track': 'bg-green-100 text-green-700 border border-green-200',
  upcoming: 'bg-blue-100 text-blue-700 border border-blue-200',
  due: 'bg-amber-100 text-amber-700 border border-amber-200',
  overdue: 'bg-red-100 text-red-700 border border-red-200',
  administered: 'bg-gray-100 text-gray-500 border border-gray-200',
  snoozed: 'bg-purple-100 text-purple-700 border border-purple-200',
}

const STATUS_DOTS = {
  'on-track': 'bg-green-500',
  upcoming: 'bg-blue-500',
  due: 'bg-amber-500',
  overdue: 'bg-red-500',
  administered: 'bg-gray-400',
  snoozed: 'bg-purple-500',
}

export function StatusPill({ status, dueDate }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['on-track']
  const dot = STATUS_DOTS[status] || STATUS_DOTS['on-track']
  const label = status === 'administered' ? 'Done' : status === 'on-track' ? 'OK' : status

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-badge font-bold uppercase tracking-wider ${style}`}
      aria-label={`Status: ${status}${dueDate ? `, due ${new Date(dueDate).toLocaleDateString()}` : ''}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  )
}
