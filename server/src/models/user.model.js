import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    prefs: {
      leadDays: { type: Number, default: 7, min: 1, max: 30 },
      receivePreDue: { type: Boolean, default: true },
      receiveDue: { type: Boolean, default: true },
      receiveOverdue: { type: Boolean, default: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

userSchema.pre('save', function (next) {
  if (this.isModified('passwordHash') && this.passwordHash.length !== 60) {
    return next(new Error('passwordHash must be a bcrypt hash (60 chars)'))
  }
  next()
})

export const User = mongoose.model('User', userSchema)
