import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordInput } from './PasswordInput.jsx'

describe('PasswordInput', () => {
  it('renders a password input', () => {
    render(<PasswordInput data-testid="pw-render" />)
    expect(screen.getByTestId('pw-render')).toBeInTheDocument()
  })

  it('has password type by default', () => {
    render(<PasswordInput data-testid="pw" />)
    const input = screen.getByTestId('pw')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles visibility on button click', () => {
    render(<PasswordInput data-testid="pw" />)
    const input = screen.getByTestId('pw')
    const toggle = screen.getByLabelText('Show password')
    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument()
  })
})
