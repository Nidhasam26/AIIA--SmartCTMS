import type { RoleName } from '../types'

export interface NavigationItem {
  label: string
  path: string
}

const routes: Record<string, NavigationItem> = {
  dashboard: { label: 'Dashboard', path: '/' },
  studies: { label: 'Study registry', path: '/portfolio' },
  safety: { label: 'Safety board', path: '/safety' },
  exports: { label: 'Data exports', path: '/exports' },
  audit: { label: 'Audit trail', path: '/audit' },
  admin: { label: 'Administration', path: '/admin' },
}

const roleNavigation: Record<RoleName, NavigationItem[]> = {
  'Principal Investigator': [routes.dashboard, routes.studies, routes.safety, routes.exports],
  'Study Coordinator': [routes.dashboard, routes.studies, routes.exports],
  'Monitor (CRA)': [routes.dashboard, routes.studies],
  'Ethics Committee (IEC)': [routes.dashboard, routes.studies, routes.safety],
  'PV Officer': [routes.dashboard, routes.safety],
  DSMB: [routes.dashboard, routes.safety],
  Leadership: [routes.dashboard, routes.studies, routes.safety, routes.audit],
  Regulator: [routes.dashboard, routes.studies, routes.exports, routes.audit],
  'System Admin': [routes.dashboard, routes.studies, routes.exports, routes.audit, routes.admin],
}

export function getPersonaNavigation(role: string) {
  return roleNavigation[role as RoleName] ?? [routes.dashboard]
}