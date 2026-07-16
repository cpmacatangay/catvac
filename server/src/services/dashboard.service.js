import { Cat } from '../models/cat.model.js'
import { Vaccine } from '../models/vaccine.model.js'
import { User } from '../models/user.model.js'
import { computeStatus } from '../lib/compute-status.js'

export async function getDashboard(ownerId) {
  const [cats, vaccines, user] = await Promise.all([
    Cat.find({ ownerId, deletedAt: null }),
    Vaccine.find({ ownerId }).sort({ dueDate: 1 }),
    User.findById(ownerId),
  ])

  const leadDays = user?.prefs?.leadDays ?? 7

  return cats.map((cat) => ({
    cat,
    vaccines: vaccines
      .filter((v) => v.catId.equals(cat._id))
      .map((v) => ({
        ...v.toObject(),
        status: computeStatus(v.dueDate, leadDays, v.administered, v.snoozedUntil),
      })),
  }))
}
