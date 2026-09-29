import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AccessRestricted } from './components/AccessRestricted'
import { AppShell } from './components/AppShell'
import { LoginScreen } from './components/LoginScreen'
import { RoleGuard } from './components/RoleGuard'
import { AdminPage } from './features/admin/AdminPage'
import { AuditPage } from './features/audit/AuditPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { ExportsPage } from './features/exports/ExportsPage'
import { ECRFPage } from './features/ecrf/ECRFPage'
import { RandomisationPage } from './features/randomisation/RandomisationPage'
import { MonitoringPage } from './features/monitoring/MonitoringPage'
import { CtriFilingPage } from './features/regulatory/CtriFilingPage'
import { PortfolioPage } from './features/portfolio/PortfolioPage'
import { SafetyPage } from './features/safety/SafetyPage'
import { StudyDetailPage } from './features/study/StudyDetailPage'
import { useAppStore } from './store/appStore'

function RequireAuth({ children }: { children: ReactNode }) {
  const activeUserId = useAppStore((state) => state.activeUserId)
  return activeUserId ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="study/:studyId" element={<StudyDetailPage />} />
          <Route path="ecrf" element={<RoleGuard allowed={['Principal Investigator', 'Study Coordinator', 'Monitor (CRA)', 'System Admin']}><ECRFPage /></RoleGuard>} />
          <Route path="randomisation" element={<RoleGuard allowed={['Principal Investigator', 'Study Coordinator', 'Monitor (CRA)', 'System Admin']}><RandomisationPage /></RoleGuard>} />
          <Route path="monitoring" element={<RoleGuard allowed={['Principal Investigator', 'Study Coordinator', 'Monitor (CRA)', 'System Admin', 'Leadership']}><MonitoringPage /></RoleGuard>} />
          <Route path="regulatory" element={<RoleGuard allowed={['Principal Investigator', 'Study Coordinator', 'Regulator', 'System Admin', 'Leadership']}><CtriFilingPage /></RoleGuard>} />
          <Route path="safety" element={<RoleGuard allowed={['Principal Investigator', 'PV Officer', 'Ethics Committee (IEC)', 'DSMB', 'Leadership']}><SafetyPage /></RoleGuard>} />
          <Route path="audit" element={<RoleGuard allowed={['Regulator', 'System Admin', 'Leadership']}><AuditPage /></RoleGuard>} />
          <Route path="admin" element={<RoleGuard allowed={['System Admin']}><AdminPage /></RoleGuard>} />
          <Route path="exports" element={<RoleGuard allowed={['Principal Investigator', 'Study Coordinator', 'System Admin', 'Regulator']}><ExportsPage /></RoleGuard>} />
          <Route path="access-restricted" element={<AccessRestricted />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
