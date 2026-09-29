import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CtriFilingPage } from './CtriFilingPage'
import { useAppStore } from '../../store/appStore'

function renderCtriFiling() {
  return render(
    <MemoryRouter>
      <CtriFilingPage />
    </MemoryRouter>
  )
}

describe('CtriFilingPage & CTRI / CDSCO Package Generator', () => {
  it('renders CTRI generator form, NDCT compliance checklist, and dossier preview', () => {
    renderCtriFiling()

    expect(screen.getByRole('heading', { name: /interactive ctri filing package generator/i })).toBeInTheDocument()
    expect(screen.getByText(/cdsco ndct rules 2019 & gcp-asu regulatory verification check/i)).toBeInTheDocument()
    expect(screen.getByText(/ndct rule 12 application/i)).toBeInTheDocument()
    expect(screen.getByText(/ayush gcp-asu guidelines/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate & verify ctri dossier package/i })).toBeInTheDocument()
  })

  it('switches between CTRI and CDSCO Form CT-04 dossier preview tabs', () => {
    renderCtriFiling()

    expect(screen.getByText(/ctri submission dossier -- ayush research/i)).toBeInTheDocument()

    const cdscoTabBtn = screen.getByRole('button', { name: /cdsco form ct-04/i })
    fireEvent.click(cdscoTabBtn)

    expect(screen.getByText(/cdsco form ct-04 \(ndct rules 2019\)/i)).toBeInTheDocument()
    expect(screen.getByText(/application for permission to conduct clinical trial of new ayurvedic drug/i)).toBeInTheDocument()
  })

  it('generates and verifies CTRI regulatory submission package with audit trail', async () => {
    renderCtriFiling()

    const submitBtn = screen.getByRole('button', { name: /generate & verify ctri dossier package/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/successfully generated and marked verified/i)).toBeInTheDocument()
    })

    const state = useAppStore.getState()
    const packages = state.ctriFilingPackages.filter((p) => p.studyId === 'study-1')
    expect(packages.length).toBeGreaterThanOrEqual(1)

    // Check audit trail
    const auditEntry = state.auditEntries.find((a) => a.action.includes('CTRI filing package'))
    expect(auditEntry).toBeDefined()
  })
})
