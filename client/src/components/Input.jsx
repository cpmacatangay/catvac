import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ className = '', error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full text-body rounded-lg px-4 py-3 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
        error
          ? 'border-red-500 ring-1 ring-red-500'
          : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
      } ${className}`}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  )
})
