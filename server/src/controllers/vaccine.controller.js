import * as vaccineService from '../services/vaccine.service.js'

export async function listByCat(req, res, next) {
  try {
    const vaccines = await vaccineService.listByCat(req.params.catId, req.userId)
    res.json({ vaccines })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const vaccine = await vaccineService.create(req.body, req.userId)
    res.status(201).json({ vaccine })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const vaccine = await vaccineService.update(req.params.id, req.userId, req.body)
    res.json({ vaccine })
  } catch (err) {
    next(err)
  }
}

export async function administer(req, res, next) {
  try {
    const result = await vaccineService.administer(
      req.params.id,
      req.userId,
      req.body.administeredDate,
      req.body.note,
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function snooze(req, res, next) {
  try {
    const vaccine = await vaccineService.snooze(req.params.id, req.userId, req.body.days)
    res.json({ vaccine })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await vaccineService.remove(req.params.id, req.userId)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
