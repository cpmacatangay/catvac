import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { Logo, LogoWordmark } from './Logo.jsx'
import { Button } from './Button.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export function AppLayout({ children }) {
  const { logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    await logout()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:p-3 focus:bg-white focus:text-primary focus:underline"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <LogoWordmark size="text-h3" />
          </div>
          <Button variant="ghost" onClick={() => setShowLogoutConfirm(true)} disabled={loggingOut} loading={loggingOut}>
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
            Log out
          </Button>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="primary"
        onConfirm={() => { setShowLogoutConfirm(false); handleLogout() }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}
