import { createContext, useContext, useState, useCallback } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 200)
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type, leaving: false }])
    setTimeout(() => dismissToast(id), 5000)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const borderColor = toast.type === 'error' ? 'border-red-500' : 'border-primary'

  return (
    <div
      className={`bg-white shadow-elevated rounded-lg p-4 max-w-sm border-l-4 ${borderColor} pointer-events-auto ${toast.leaving ? 'motion-safe:animate-slide-out' : 'motion-safe:animate-slide-in'}`}
    >
      <div className="flex items-start gap-3">
        <p className="text-body-sm text-gray-800 flex-1">{toast.message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
