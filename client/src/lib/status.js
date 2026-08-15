const RANK = {
  overdue: 5,
  due: 4,
  upcoming: 3,
  snoozed: 2,
  'on-track': 1,
  administered: 0,
}

export function statusRank(status) {
  return RANK[status] ?? 1
}

export function worstStatus(vaccines = []) {
  let worst = null
  let worstRank = -1
  for (const v of vaccines) {
    const r = statusRank(v.status)
    if (r > worstRank) {
      worstRank = r
      worst = v.status
    }
  }
  return worst
}
