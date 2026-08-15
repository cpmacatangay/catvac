import { describe, it, expect } from 'vitest'
import { User } from '../src/models/user.model.js'

const VALID_HASH = '$2b$12$4Ue1VKMY3hQfQpHO7r1w8uShBtFVAZkoQbPMFrymTb7YBJdsp2fVK'

describe('User model — pre("save") passwordHash invariant', () => {
  it('does not throw for a valid 60-char bcrypt hash on a new document', async () => {
    const doc = new User({ email: 'hash-test@catvac.app', passwordHash: VALID_HASH })
    await expect(User.schema.s.hooks.execPre('save', doc, [{}])).resolves.toBeDefined()
  })

  it('throws when passwordHash is not 60 chars', async () => {
    const doc = new User({ email: 'hash-test@catvac.app', passwordHash: 'short' })
    await expect(User.schema.s.hooks.execPre('save', doc, [{}])).rejects.toThrow(
      'passwordHash must be a bcrypt hash (60 chars)',
    )
  })

  it('does not throw when passwordHash is unmodified', async () => {
    const doc = new User({ email: 'hash-test@catvac.app', passwordHash: VALID_HASH })
    doc.isModified = () => false
    await expect(User.schema.s.hooks.execPre('save', doc, [{}])).resolves.toBeDefined()
  })
})
