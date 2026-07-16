import { useState, useEffect } from 'react'

export function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const bg = type === 'error' ? 'border-red-500' : 'border-primary'

  return (
    <div className={`fixed top-4 right-4 bg-white shadow-elevated rounded-lg p-4 max-w-sm border-l-4 ${bg} z-50`}>
      <p className="text-sm text-gray-800">{message}</p>
    </div>
  )
}
