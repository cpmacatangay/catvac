import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext.jsx'

function TestConsumer() {
  const { addToast } = useToast()
  return (
    <div>
      <button onClick={() => addToast('Hello', 'success')}>Add success</button>
      <button onClick={() => addToast('Error!', 'error')}>Add error</button>
    </div>
  )
}

function renderWithProvider(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('ToastContext', () => {
  it('renders children', () => {
    renderWithProvider(<p data-testid="child">ok</p>)
    expect(screen.getByTestId('child')).toHaveTextContent('ok')
  })

  it('shows a toast when addToast is called', () => {
    renderWithProvider(<TestConsumer />)
    fireEvent.click(screen.getByText('Add success'))
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('shows an error toast', () => {
    renderWithProvider(<TestConsumer />)
    fireEvent.click(screen.getByText('Add error'))
    expect(screen.getByText('Error!')).toBeInTheDocument()
  })

  it('auto-dismisses toast after 5000ms', () => {
    vi.useFakeTimers()
    renderWithProvider(<TestConsumer />)
    fireEvent.click(screen.getByText('Add success'))
    expect(screen.getByText('Hello')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('dismisses toast when close button is clicked', () => {
    renderWithProvider(<TestConsumer />)
    fireEvent.click(screen.getByText('Add success'))
    expect(screen.getByText('Hello')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })

  it('throws useToast when used outside provider', () => {
    function Bad() {
      useToast()
      return null
    }
    expect(() => render(<Bad />)).toThrow('useToast must be used within a ToastProvider')
  })
})
