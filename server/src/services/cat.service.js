import { Cat } from '../models/cat.model.js'
import { NotFoundError } from '../lib/errors.js'

export async function listByOwner(ownerId) {
  return Cat.find({ ownerId }).sort({ name: 1 })
}

export async function getById(catId, ownerId) {
  const cat = await Cat.findOne({ _id: catId, ownerId })
  if (!cat) throw new NotFoundError('Cat not found')
  return cat
}

export async function create(data, ownerId) {
  return Cat.create({ ...data, ownerId })
}

export async function update(catId, ownerId, data) {
  const cat = await Cat.findOneAndUpdate({ _id: catId, ownerId }, data, {
    new: true,
    runValidators: true,
  })
  if (!cat) throw new NotFoundError('Cat not found')
  return cat
}

export async function softDelete(catId, ownerId) {
  const cat = await Cat.findOneAndUpdate(
    { _id: catId, ownerId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  )
  if (!cat) throw new NotFoundError('Cat not found')
  return cat
}
