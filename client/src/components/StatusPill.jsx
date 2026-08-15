import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const STATUS_CONFIG = {
  'on-track': { bg: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400', Icon: CheckCircleIcon, label: 'On track' },
  upcoming: { bg: 'bg-blue-100 text-blue-700 border border-blue-200', dot: 'bg-blue-500', Icon: ClockIcon, label: 'Upcoming' },
  due: { bg: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500', Icon: ExclamationTriangleIcon, label: 'Due' },
  overdue: { bg: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500', Icon: ExclamationCircleIcon, label: 'Overdue' },
  administered: { bg: 'bg-green-600 text-white border border-green-600', dot: 'bg-white', Icon: CheckCircleIcon, label: 'Done' },
  snoozed: { bg: 'bg-purple-100 text-purple-700 border border-purple-200', dot: 'bg-purple-500', Icon: ArrowPathIcon, label: 'Snoozed' },
}

export function StatusPill({ status, dueDate }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['on-track']
  const { Icon } = config

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-badge font-bold uppercase tracking-wider ${config.bg}`}
      aria-label={`Status: ${config.label}${dueDate ? `, due ${new Date(dueDate).toLocaleDateString()}` : ''}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </span>
  )
}
