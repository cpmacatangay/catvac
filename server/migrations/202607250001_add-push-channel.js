export async function up(db) {
  const logs = db.collection('reminderlogs')

  await logs.dropIndex({ vaccineId: 1, type: 1, windowDate: 1 })

  await logs.updateMany(
    { channel: { $exists: false } },
    { $set: { channel: 'email' } },
  )

  await logs.createIndex(
    { vaccineId: 1, type: 1, windowDate: 1, channel: 1 },
    { unique: true },
  )
}

export async function down(db) {
  const logs = db.collection('reminderlogs')

  await logs.dropIndex({ vaccineId: 1, type: 1, windowDate: 1, channel: 1 })

  await logs.createIndex(
    { vaccineId: 1, type: 1, windowDate: 1 },
    { unique: true },
  )

  await logs.updateMany({}, { $unset: { channel: '' } })
}
