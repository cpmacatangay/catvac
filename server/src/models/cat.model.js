import mongoose from 'mongoose'

const catSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    breed: { type: String, default: null, maxlength: 100 },
    dob: {
      type: Date,
      default: null,
      validate: {
        validator: (v) => v === null || v < new Date(),
        message: 'Date of birth must be in the past',
      },
    },
    sex: { type: String, default: null, enum: [null, 'M', 'F'] },
    photoUrl: { type: String, default: null, maxlength: 500 },
    notes: { type: String, default: null, maxlength: 500 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

catSchema.index({ ownerId: 1, deletedAt: 1 })

catSchema.pre(/^find/, function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ deletedAt: null })
  }
})

export const Cat = mongoose.model('Cat', catSchema)
