import { startOfDay, differenceInDays } from 'date-fns'

export function computeStatus(dueDate, leadDays = 7, administered = false, snoozedUntil = null) {
  const today = startOfDay(new Date())
  const due = startOfDay(dueDate)
  const diffDays = differenceInDays(due, today)

  if (administered) return 'administered'
  if (snoozedUntil && snoozedUntil > today) return 'snoozed'
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due'
  if (diffDays <= leadDays) return 'upcoming'
  return 'on-track'
}
