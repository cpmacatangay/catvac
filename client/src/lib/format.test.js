import { describe, it, expect } from 'vitest'
import { formatDate, formatRelative } from './format.js'

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2026-07-20')).toBe('Jul 20, 2026')
  })

  it('formats a Date object', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('Jan 5, 2026')
  })
})

describe('formatRelative', () => {
  it('shows overdue for past dates', () => {
    const past = new Date()
    past.setDate(past.getDate() - 3)
    expect(formatRelative(past.toISOString())).toBe('3 days overdue')
  })

  it('shows 1 day overdue', () => {
    const past = new Date()
    past.setDate(past.getDate() - 1)
    expect(formatRelative(past.toISOString())).toBe('1 day overdue')
  })

  it('shows due today', () => {
    expect(formatRelative(new Date().toISOString())).toBe('Due today')
  })

  it('shows due tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(formatRelative(tomorrow.toISOString())).toBe('Due tomorrow')
  })

  it('shows days until due within a week', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    expect(formatRelative(future.toISOString())).toBe(`Due in 5 days`)
  })

  it('falls back to date for far future', () => {
    const future = new Date()
    future.setDate(future.getDate() + 30)
    expect(formatRelative(future.toISOString())).toMatch(/^[A-Z][a-z]{2} \d{1,2}, 2026$/)
  })
})
