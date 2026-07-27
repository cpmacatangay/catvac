import { useState, forwardRef } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Input } from './Input.jsx'

export const PasswordInput = forwardRef(function PasswordInput({ className, error, ...props }, ref) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        error={error}
        className={`pr-12 ${className ?? ''}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-md"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeSlashIcon className="h-5 w-5" aria-hidden /> : <EyeIcon className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  )
})
