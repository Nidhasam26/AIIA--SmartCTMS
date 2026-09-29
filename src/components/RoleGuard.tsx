import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

export function RoleGuard({ allowed, children }: { allowed: string[]; children: ReactNode }) {
  const activeRole = useAppStore((state) => state.activeRole)

  if (!allowed.includes(activeRole)) {
    return <Navigate to="/access-restricted" replace />
  }

  return <>{children}</>
}
