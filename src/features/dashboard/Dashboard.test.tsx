import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Dashboard } from './Dashboard'
import { useAppStore } from '../../store/appStore'

describe('dashboard alert visibility', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAppStore.getState().resetDemoData()
  })

  it('uses role-scoped alerts and does not show hard-coded subject identifiers', () => {
    render(<Dashboard />)
    expect(screen.getByRole('heading', { name: 'Investigator dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Open deviations')).toBeInTheDocument()
    expect(screen.getByText('Open queries')).toBeInTheDocument()
    expect(screen.queryByText(/PT-\d{6}/)).not.toBeInTheDocument()
  })

  it('updates the IEC expiring approval count after renewal', async () => {
    useAppStore.getState().setActiveUser('u4')
    render(<Dashboard />)
    const count = screen.getByText('Approvals expiring within 60 days').nextElementSibling
    expect(count).toHaveTextContent('1')

    await act(async () => useAppStore.getState().renewEthicsApproval('study-1', 'iec-renewal.pdf', 'Dashboard renewal test'))
    expect(count).toHaveTextContent('0')
  })

  it.each([
    ['Principal Investigator', 'Investigator dashboard'],
    ['Study Coordinator', 'Coordinator workspace'],
    ['Monitor (CRA)', 'Monitoring dashboard'],
    ['Ethics Committee (IEC)', 'Ethics review dashboard'],
    ['PV Officer', 'Pharmacovigilance dashboard'],
    ['Leadership', 'Leadership compliance dashboard'],
    ['DSMB', 'DSMB aggregate safety dashboard'],
    ['Regulator', 'Regulatory status dashboard'],
    ['System Admin', 'System administration dashboard'],
  ])('%s receives a distinct dashboard title', (role, title) => {
    act(() => useAppStore.getState().setActiveRole(role as string))
    render(<Dashboard />)
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })
})