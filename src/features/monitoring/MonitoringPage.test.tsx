import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MonitoringPage } from './MonitoringPage'
import { useAppStore } from '../../store/appStore'

function renderMonitoring() {
  return render(
    <MemoryRouter>
      <MonitoringPage />
    </MemoryRouter>
  )
}

describe('MonitoringPage & CRA Trip Reports', () => {
  it('renders SIV readiness checklist, SDV tracker, and trip report submission form', () => {
    renderMonitoring()

    expect(screen.getByRole('heading', { name: /site monitoring \(cra\) & trip reports/i })).toBeInTheDocument()
    expect(screen.getByText(/site initiation visit \(siv\) readiness protocol checklist/i)).toBeInTheDocument()
    expect(screen.getByText(/investigator protocol & ecrf training/i)).toBeInTheDocument()
    expect(screen.getByText(/generate cra visit report/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign & submit monitoring report/i })).toBeInTheDocument()
  })

  it('adds an action finding item and submits signed CRA monitoring report', async () => {
    renderMonitoring()

    // Add finding item
    const descInput = screen.getByPlaceholderText(/finding description\.\.\./i)
    fireEvent.change(descInput, { target: { value: 'Calibration log missing on herbal storage hygrometer' } })

    const addFindingBtn = screen.getByRole('button', { name: /add finding action/i })
    fireEvent.click(addFindingBtn)

    expect(screen.getByText(/calibration log missing on herbal storage hygrometer/i)).toBeInTheDocument()

    // Submit report
    const submitBtn = screen.getByRole('button', { name: /sign & submit monitoring report/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/successfully logged and signed/i)).toBeInTheDocument()
    })

    const state = useAppStore.getState()
    const reports = state.monitoringReports.filter((r) => r.studyId === 'study-1')
    expect(reports.length).toBeGreaterThanOrEqual(1)

    // Check audit trail
    const auditEntry = state.auditEntries.find((a) => a.action.includes('CRA monitoring report'))
    expect(auditEntry).toBeDefined()
  })
})
