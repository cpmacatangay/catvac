export async function up(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })

  await db.collection('cats').createIndex({ ownerId: 1 })
  await db.collection('cats').createIndex({ ownerId: 1, deletedAt: 1 })

  await db.collection('vaccines').createIndex({ ownerId: 1, catId: 1, dueDate: 1 })
  await db.collection('vaccines').createIndex({ dueDate: 1, administered: 1 })
  await db.collection('vaccines').createIndex({ ownerId: 1, dueDate: 1 })
  await db.collection('vaccines').createIndex({ catId: 1 })

  await db.collection('reminderlog').createIndex(
    { vaccineId: 1, type: 1, windowDate: 1 },
    { unique: true },
  )
  await db.collection('reminderlog').createIndex(
    { sentAt: 1 },
    { expireAfterSeconds: 90 * 24 * 3600 },
  )
}

export async function down(db) {
  await db.collection('users').dropIndex({ email: 1 })
  await db.collection('cats').dropIndex({ ownerId: 1 })
  await db.collection('cats').dropIndex({ ownerId: 1, deletedAt: 1 })
  await db.collection('vaccines').dropIndex({ ownerId: 1, catId: 1, dueDate: 1 })
  await db.collection('vaccines').dropIndex({ dueDate: 1, administered: 1 })
  await db.collection('vaccines').dropIndex({ ownerId: 1, dueDate: 1 })
  await db.collection('vaccines').dropIndex({ catId: 1 })
  await db.collection('reminderlog').dropIndex({ vaccineId: 1, type: 1, windowDate: 1 })
  await db.collection('reminderlog').dropIndex({ sentAt: 1 })
}
