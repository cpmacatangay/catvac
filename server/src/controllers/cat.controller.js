import * as catService from '../services/cat.service.js'

export async function list(req, res, next) {
  try {
    const cats = await catService.listByOwner(req.userId)
    res.json({ cats })
  } catch (err) {
    next(err)
  }
}

export async function getById(req, res, next) {
  try {
    const cat = await catService.getById(req.params.id, req.userId)
    res.json({ cat })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const cat = await catService.create(req.body, req.userId)
    res.status(201).json({ cat })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const cat = await catService.update(req.params.id, req.userId, req.body)
    res.json({ cat })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await catService.softDelete(req.params.id, req.userId)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
