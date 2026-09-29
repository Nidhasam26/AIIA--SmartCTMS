import { Bell, BellOff, LogOut, Moon, ShieldCheck, Sun, UserCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { users } from '../data/seed'
import { useAppStore } from '../store/appStore'
import { startSessionTimeout } from '../lib/sessionTimeout'
import { getPersonaNavigation } from '../lib/personaNavigation'

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const resetSessionRef = useRef<() => void>(() => undefined)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const activeRole = useAppStore((state) => state.activeRole)
  const alerts = useAppStore((state) => state.alerts)
  const setActiveRole = useAppStore((state) => state.setActiveRole)
  const expireSession = useAppStore((state) => state.expireSession)
  const resetDemoData = useAppStore((state) => state.resetDemoData)

  const user = users.find((entry) => entry.id === activeUserId) ?? users[0]
  const navItems = getPersonaNavigation(activeRole)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Storage unavailable
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    const session = startSessionTimeout(
      () => setShowTimeoutWarning(true),
      () => {
        setShowTimeoutWarning(false)
        expireSession()
        navigate('/login')
      },
    )
    resetSessionRef.current = session.reset
    const resetOnActivity = () => {
      setShowTimeoutWarning(false)
      session.reset()
    }
    window.addEventListener('pointerdown', resetOnActivity)
    window.addEventListener('keydown', resetOnActivity)
    return () => {
      window.removeEventListener('pointerdown', resetOnActivity)
      window.removeEventListener('keydown', resetOnActivity)
      session.stop()
    }
  }, [expireSession, navigate])

  const visibleAlerts = alerts.filter((alert) => alert.role === activeRole || activeRole === 'Leadership' || activeRole === 'System Admin')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0a0f14] dark:text-slate-100 transition-colors duration-150">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0d141c]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-600 p-2 font-bold text-white shadow-sm shadow-teal-900/30">AIIA</div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-600 dark:text-teal-400">SmartCTMS</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Clinical Trial Management System</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeRole}
              onChange={(event) => {
                const nextRole = event.target.value
                setActiveRole(nextRole)
                navigate('/')
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900"
            >
              {users.map((entry) => (
                <option key={entry.id} value={entry.role}>{entry.role}</option>
              ))}
            </select>
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:hover:bg-slate-800"
              aria-label="Theme toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'dark' ? <Sun size={16} className="text-teal-400" /> : <Moon size={16} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications((open) => !open)}
                className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {visibleAlerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {visibleAlerts.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                  <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Alert centre</div>
                  <div className="space-y-2">
                    {visibleAlerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5 dark:text-slate-400">
                        <BellOff size={18} className="text-teal-500" />
                        <span>No current alerts</span>
                      </div>
                    ) : (
                      visibleAlerts.map((alert) => (
                        <div key={alert.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{alert.title}</div>
                          <div className="mt-1 text-slate-500 dark:text-slate-400">{alert.description}</div>
                          {alert.evidence && <div className="mt-1 text-slate-500 dark:text-slate-400">Evidence: {alert.evidence}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700/80 dark:bg-slate-900">
              <UserCircle2 size={18} className="text-teal-500" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.role}</div>
                <div className="text-sm font-medium">{user.name}</div>
              </div>
            </div>
            <button
              onClick={() => {
                expireSession()
                navigate('/login')
              }}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-400 transition"
            >
              <span className="inline-flex items-center gap-2"><LogOut size={14} />Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0f1720]/70">
          <nav className="space-y-1.5 text-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    isActive
                      ? 'bg-teal-500/10 font-semibold text-teal-700 border-l-2 border-teal-600 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-400'
                      : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-6 rounded-lg border border-teal-200/80 bg-teal-50/70 p-3 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-200">
            <div className="flex items-center gap-2 font-semibold text-teal-800 dark:text-teal-300">
              <ShieldCheck size={14} /> Data hosted in India (design intent)
            </div>
            <div className="mt-2 text-[11px] leading-relaxed opacity-90">
              Prototype. Synthetic data. Does not file with CTRI/CDSCO.
            </div>
            {activeRole === 'System Admin' && (
              <>
                <button
                  onClick={() => { resetDemoData(); setResetComplete(true) }}
                  className="mt-3 rounded-lg border border-teal-800/30 px-2 py-1 font-medium hover:bg-teal-100 dark:border-teal-700/50 dark:hover:bg-teal-900/40"
                >
                  Reset demo data
                </button>
              </>
            )}
            {resetComplete && <div role="status" className="mt-2 text-teal-700 dark:text-teal-400">Demo data reset to seed values.</div>}
          </div>
        </aside>

        <main className="min-w-0 rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0f1720]/70">
          <Outlet />
        </main>
      </div>
      {showTimeoutWarning && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="session-warning-heading" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-amber-400/80 bg-white p-4 shadow-xl backdrop-blur-md dark:border-amber-600/80 dark:bg-slate-900/95">
          <h2 id="session-warning-heading" className="font-semibold text-amber-900 dark:text-amber-200">Session expiring soon</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your session will expire in 2 minutes due to inactivity.</p>
          <button
            onClick={() => { setShowTimeoutWarning(false); resetSessionRef.current() }}
            className="mt-3 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition"
          >
            Stay signed in
          </button>
        </div>
      )}
    </div>
  )
}
