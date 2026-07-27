import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input.jsx'

describe('Input', () => {
  it('renders an input', () => {
    render(<Input data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })

  it('has red border when error is true', () => {
    render(<Input data-testid="test-input" error />)
    expect(screen.getByTestId('test-input').className).toContain('border-red-500')
  })

  it('applies aria-invalid when error', () => {
    render(<Input data-testid="test-input" error />)
    expect(screen.getByTestId('test-input')).toHaveAttribute('aria-invalid', 'true')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
