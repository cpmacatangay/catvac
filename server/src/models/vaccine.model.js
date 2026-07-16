import mongoose from 'mongoose'
import { startOfDay, differenceInDays } from 'date-fns'

const vaccineSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    catId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cat', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    dueDate: { type: Date, required: true },
    intervalMonths: { type: Number, default: null, min: 1, max: 120 },
    administered: { type: Boolean, default: false },
    administeredDate: { type: Date, default: null },
    administeredNote: { type: String, default: null, maxlength: 500 },
    snoozedUntil: { type: Date, default: null },
  },
  { timestamps: true },
)

vaccineSchema.virtual('status').get(function () {
  const today = startOfDay(new Date())
  const due = startOfDay(this.dueDate)
  const diffDays = differenceInDays(due, today)

  if (this.administered) return 'administered'
  if (this.snoozedUntil && this.snoozedUntil > today) return 'snoozed'
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due'
  return 'pending'
})

vaccineSchema.set('toJSON', { virtuals: true })
vaccineSchema.set('toObject', { virtuals: true })

vaccineSchema.index({ ownerId: 1, catId: 1, dueDate: 1 })
vaccineSchema.index({ dueDate: 1, administered: 1 })
vaccineSchema.index({ ownerId: 1, dueDate: 1 })
vaccineSchema.index({ catId: 1 })

export const Vaccine = mongoose.model('Vaccine', vaccineSchema)
