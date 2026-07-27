import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null)

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  useEffect(() => {
    if (!open) return
    const firstFocusable = dialogRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    firstFocusable?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-elevated p-6 w-full max-w-lg motion-safe:animate-fade-in space-y-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="font-heading text-h3 text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
