import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PortfolioPage } from '../src/features/portfolio/PortfolioPage'
import { StudyDetailPage } from '../src/features/study/StudyDetailPage'
import { AppShell } from '../src/components/AppShell'
import { LoginScreen } from '../src/components/LoginScreen'
import { AdminPage } from '../src/features/admin/AdminPage'
import { RoleGuard } from '../src/components/RoleGuard'
import { useAppStore } from '../src/store/appStore'

console.log('=== ITEM 3: PORTFOLIO FILTERS BROWSER EVIDENCE ===')
{
  const { container } = render(
    <MemoryRouter initialEntries={['/portfolio']}>
      <PortfolioPage />
    </MemoryRouter>
  )

  const searchInput = screen.getByLabelText(/search studies/i)
  const statusSelect = screen.getByLabelText(/filter by status/i)

  // Initial state
  console.log('Initial result text:', screen.getByRole('status').textContent)

  // Apply search 'AYUSH' and status 'At Risk'
  fireEvent.change(searchInput, { target: { value: 'AYUSH' } })
  fireEvent.change(statusSelect, { target: { value: 'At Risk' } })

  console.log('Filtered result counter text:', screen.getByRole('status').textContent)
  const rows = Array.from(container.querySelectorAll('tbody tr')).map(tr => {
    return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()).join(' | ')
  })
  console.log('Filtered Table Rows (Total: ' + rows.length + '):')
  rows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`))
}

console.log('\n=== ITEM 4: STUDY TABS RENDERED CONTENT EVIDENCE ===')
{
  // Overview Tab
  const { container: c1, unmount: u1 } = render(
    <MemoryRouter initialEntries={['/study/study-1']}>
      <Routes>
        <Route path="/study/:studyId" element={<StudyDetailPage />} />
      </Routes>
    </MemoryRouter>
  )

  console.log('[Tab 1: Overview Panel Text Snippet]:')
  console.log(c1.querySelector('#panel-overview')?.textContent?.substring(0, 350) + '...')
  u1()

  // Lifecycle Tab
  const { container: c2, unmount: u2 } = render(
    <MemoryRouter initialEntries={['/study/study-1']}>
      <Routes>
        <Route path="/study/:studyId" element={<StudyDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
  fireEvent.click(screen.getByRole('tab', { name: /lifecycle/i }))
  console.log('\n[Tab 2: Lifecycle Panel Text Snippet]:')
  console.log(c2.querySelector('#panel-lifecycle')?.textContent?.substring(0, 350) + '...')
  u2()

  // Ethics & CTRI Tab
  const { container: c3, unmount: u3 } = render(
    <MemoryRouter initialEntries={['/study/study-1']}>
      <Routes>
        <Route path="/study/:studyId" element={<StudyDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
  fireEvent.click(screen.getByRole('tab', { name: /ethics/i }))
  console.log('\n[Tab 3: Ethics & CTRI Panel Text Snippet]:')
  console.log(c3.querySelector('#panel-ethics')?.textContent?.substring(0, 350) + '...')
  u3()

  // Safety Tab
  const { container: c4, unmount: u4 } = render(
    <MemoryRouter initialEntries={['/study/study-1']}>
      <Routes>
        <Route path="/study/:studyId" element={<StudyDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
  fireEvent.click(screen.getByRole('tab', { name: /safety/i }))
  console.log('\n[Tab 4: Safety Panel Text Snippet]:')
  console.log(c4.querySelector('#panel-safety')?.textContent?.substring(0, 350) + '...')
  u4()
}

console.log('\n=== ITEM 5: THEME TOGGLE & PERSISTENCE EVIDENCE ===')
{
  localStorage.clear()
  const { container, unmount } = render(
    <MemoryRouter initialEntries={['/']}>
      <AppShell />
    </MemoryRouter>
  )

  console.log('Initial documentElement.classList:', Array.from(document.documentElement.classList).join(' ') || '(none)')
  console.log('Initial localStorage.theme:', localStorage.getItem('theme'))

  // Click theme toggle
  const toggleBtn = screen.getByRole('button', { name: /theme toggle/i })
  fireEvent.click(toggleBtn)

  console.log('After Toggle - documentElement.classList:', Array.from(document.documentElement.classList).join(' '))
  console.log('After Toggle - localStorage.theme:', localStorage.getItem('theme'))

  unmount()

  // Simulate Page Reload with persisted localStorage
  const { container: reloadedContainer } = render(
    <MemoryRouter initialEntries={['/']}>
      <AppShell />
    </MemoryRouter>
  )
  console.log('After Page Reload - documentElement.classList:', Array.from(document.documentElement.classList).join(' '))
  console.log('After Page Reload - localStorage.theme:', localStorage.getItem('theme'))
}

console.log('\n=== ITEM 7: LOGIN SCREEN, MFA STEP, AND ROUTE GATING EVIDENCE ===')
{
  const { container } = render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin" element={<RoleGuard allowed={['System Admin']}><AdminPage /></RoleGuard>} />
        <Route path="/access-restricted" element={<div>Access Restricted Page Content</div>} />
      </Routes>
    </MemoryRouter>
  )

  // Select Study Coordinator
  const coordCard = screen.getByText('Study Coordinator').closest('button')
  fireEvent.click(coordCard)
  console.log('Step 1: Selected persona Study Coordinator (email:', (screen.getByLabelText(/clinical email/i)).value + ')')

  // Continue to MFA
  fireEvent.click(screen.getByRole('button', { name: /continue to mfa/i }))
  console.log('Step 2: Reached MFA Screen. Heading:', screen.getByRole('heading', { name: /two-factor authentication/i }).textContent)
  console.log('Step 2: 6-digit MFA Input value:', (screen.getByLabelText(/6-digit verification code/i)).value)

  // Verify MFA and sign in
  fireEvent.click(screen.getByRole('button', { name: /verify mfa & sign in/i }))
  const activeRole = useAppStore.getState().activeRole
  console.log('Step 3: Authenticated active role in store:', activeRole)

  // Check route gating for non-admin role accessing /admin
  const { container: routeContainer } = render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<RoleGuard allowed={['System Admin']}><AdminPage /></RoleGuard>} />
        <Route path="/access-restricted" element={<div data-testid="restricted">Access Restricted - System Admin role required</div>} />
      </Routes>
    </MemoryRouter>
  )

  console.log('Step 4: Attempted navigation to /admin with active role "' + activeRole + '". Rendered:')
  console.log('  ', routeContainer.textContent)
}
