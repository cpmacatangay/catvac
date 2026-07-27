import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field.jsx'

describe('Field', () => {
  it('renders label and children', () => {
    render(
      <Field label="Name" htmlFor="name-input">
        <input id="name-input" />
      </Field>,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    render(
      <Field label="Email" htmlFor="email-input">
        <input id="email-input" />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(
      <Field label="Name" htmlFor="name-input" error="Required">
        <input id="name-input" />
      </Field>,
    )
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(
      <Field htmlFor="input">
        <input id="input" />
      </Field>,
    )
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })
})
