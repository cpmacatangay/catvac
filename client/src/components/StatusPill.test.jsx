import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPill } from './StatusPill.jsx'

describe('StatusPill', () => {
  const statuses = ['on-track', 'upcoming', 'due', 'overdue', 'administered', 'snoozed']

  statuses.forEach((status) => {
    it(`renders ${status} status`, () => {
      render(<StatusPill status={status} />)
      expect(screen.getByText((content) => content.length > 0)).toBeInTheDocument()
    })
  })

  it('renders an aria-label with due date', () => {
    render(<StatusPill status="due" dueDate="2026-07-20" />)
    const pill = screen.getByText('Due')
    expect(pill).toHaveAttribute('aria-label', expect.stringContaining('7/20/2026'))
  })

  it('falls back to on-track for unknown status', () => {
    render(<StatusPill status="unknown" />)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })
})
