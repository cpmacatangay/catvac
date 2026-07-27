import { addMonths } from 'date-fns'
import { Vaccine } from '../models/vaccine.model.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'

export async function listByCat(catId, ownerId) {
  return Vaccine.find({ catId, ownerId }).sort({ dueDate: 1 })
}

export async function create(data, ownerId) {
  return Vaccine.create({ ...data, ownerId })
}

export async function update(vaccineId, ownerId, data) {
  const vaccine = await Vaccine.findOneAndUpdate({ _id: vaccineId, ownerId }, data, {
    new: true,
    runValidators: true,
  })
  if (!vaccine) throw new NotFoundError('Vaccine not found')
  return vaccine
}

export async function administer(vaccineId, ownerId, administeredDate, note) {
  const update = {
    administered: true,
    administeredDate: administeredDate || new Date(),
  }
  if (note) update.administeredNote = note

  const vaccine = await Vaccine.findOneAndUpdate(
    { _id: vaccineId, ownerId, administered: false },
    { $set: update },
    { new: true },
  )
  if (!vaccine) {
    const existing = await Vaccine.findOne({ _id: vaccineId, ownerId })
    if (!existing) throw new NotFoundError('Vaccine not found')
    throw new ValidationError('Vaccine already administered')
  }

  let nextBooster = null
  if (vaccine.intervalMonths) {
    const nextDue = addMonths(vaccine.administeredDate, vaccine.intervalMonths)
    nextBooster = await Vaccine.create({
      ownerId,
      catId: vaccine.catId,
      name: vaccine.name,
      dueDate: nextDue,
      intervalMonths: vaccine.intervalMonths,
    })
  }

  return { vaccine, nextBooster }
}

export async function snooze(vaccineId, ownerId, days = 30) {
  const { addDays } = await import('date-fns')
  const vaccine = await Vaccine.findOne({ _id: vaccineId, ownerId })
  if (!vaccine) throw new NotFoundError('Vaccine not found')

  vaccine.snoozedUntil = addDays(new Date(), days)
  await vaccine.save()
  return vaccine
}

export async function remove(vaccineId, ownerId) {
  const vaccine = await Vaccine.findOneAndDelete({ _id: vaccineId, ownerId })
  if (!vaccine) throw new NotFoundError('Vaccine not found')
  return vaccine
}
