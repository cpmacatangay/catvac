import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CatCard } from './CatCard.jsx'

function makeCat(overrides = {}) {
  return { _id: '1', name: 'Milo', breed: 'Siamese', sex: 'M', ...overrides }
}

describe('CatCard', () => {
  it('renders cat name and breed', () => {
    render(<CatCard cat={makeCat()} vaccines={[]} onClick={vi.fn()} />)
    expect(screen.getByText('Milo')).toBeInTheDocument()
    expect(screen.getByText('Siamese · Male')).toBeInTheDocument()
  })

  it('shows Cat fallback when no breed or sex', () => {
    render(<CatCard cat={makeCat({ breed: null, sex: null })} vaccines={[]} onClick={vi.fn()} />)
    expect(screen.getByText('Cat')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CatCard cat={makeCat()} vaccines={[]} onClick={onClick} />)
    fireEvent.click(screen.getByText('Milo').closest('div'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<CatCard cat={makeCat()} vaccines={[]} onClick={onClick} />)
    fireEvent.keyDown(screen.getByText('Milo').closest('div'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows vaccines', () => {
    const vaccines = [{ _id: 'v1', name: 'Rabies', dueDate: '2026-12-01', status: 'due' }]
    render(<CatCard cat={makeCat()} vaccines={vaccines} onClick={vi.fn()} />)
    expect(screen.getByText('Rabies')).toBeInTheDocument()
  })
})
