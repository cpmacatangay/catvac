import { useEffect, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
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
    const raf = requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      firstFocusable?.focus()
    })
    return () => cancelAnimationFrame(raf)
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
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-heading text-h3 text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center h-11 w-11 rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
