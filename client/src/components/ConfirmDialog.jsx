import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button.jsx'

export function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onCancel?.()
    },
    [onCancel],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    const firstFocusable = dialogRef.current?.querySelector('button')
    firstFocusable?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onCancel}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-elevated p-6 max-w-sm w-full motion-safe:animate-fade-in space-y-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h3 id="confirm-title" className="font-heading text-subtitle text-gray-800">
          {title}
        </h3>
        {message && <p className="text-body-sm text-gray-600">{message}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
