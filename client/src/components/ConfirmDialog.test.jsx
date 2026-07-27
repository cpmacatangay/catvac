import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog.jsx'

describe('ConfirmDialog', () => {
  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete item?"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders default button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
    expect(screen.getByText('No, keep')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/40')
    fireEvent.click(overlay)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not respond to Escape when closed', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={false}
        title="Test"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('renders the correct variant class on the confirm button', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        variant="danger"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const confirmBtn = screen.getByText('Confirm').closest('button')
    expect(confirmBtn.className).toContain('bg-red-600')
  })
})
