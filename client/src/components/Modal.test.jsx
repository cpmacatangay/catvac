import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal.jsx'

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(<Modal open={false} onClose={vi.fn()} title="Test" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(<Modal open={true} onClose={vi.fn()} title="My Title" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <p>Child content</p>
      </Modal>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Modal open={true} onClose={onClose} title="Test" />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(<Modal open={true} onClose={onClose} title="Test" />)
    const overlay = document.querySelector('[aria-hidden="true"]')
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<Modal open={true} onClose={onClose} title="Test" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not respond to Escape when closed', () => {
    const onClose = vi.fn()
    render(<Modal open={false} onClose={onClose} title="Test" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
