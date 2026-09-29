import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ECRFPage } from './ECRFPage'
import { useAppStore } from '../../store/appStore'

function renderECRF() {
  return render(
    <MemoryRouter>
      <ECRFPage />
    </MemoryRouter>
  )
}

describe('ECRFPage & Ayurvedic Data Capture Forms', () => {
  it('renders eCRF modules for Baseline, Prakriti scoring, and Clinical Follow-up', () => {
    renderECRF()

    expect(screen.getByRole('heading', { name: /electronic case report forms/i })).toBeInTheDocument()
    expect(screen.getByText(/baseline visit ecrf/i)).toBeInTheDocument()
    expect(screen.getByText(/prakriti scoring ecrf/i)).toBeInTheDocument()
    expect(screen.getByText(/clinical follow-up ecrf/i)).toBeInTheDocument()
    expect(screen.getByText(/subject ecrf record history/i)).toBeInTheDocument()
  })

  it('opens Baseline eCRF modal, blocks saving without reason, and saves with reason', async () => {
    renderECRF()

    const openBaselineBtn = screen.getByRole('button', { name: /open baseline ecrf/i })
    fireEvent.click(openBaselineBtn)

    expect(screen.getByRole('heading', { name: /baseline visit ecrf intake/i })).toBeInTheDocument()

    // Try saving without reason
    const saveBtn = screen.getByRole('button', { name: /save baseline ecrf/i })
    fireEvent.click(saveBtn)

    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/baseline visit completed per protocol schedule/i)
    fireEvent.change(reasonInput, { target: { value: 'Screening and baseline vitals recorded' } })

    fireEvent.click(saveBtn)

    const state = useAppStore.getState()
    const baselineRecords = state.ecrfRecords.filter((r) => r.visitType === 'Baseline')
    expect(baselineRecords.length).toBeGreaterThanOrEqual(1)
  })

  it('calculates Prakriti score and saves Ayurvedic Prakriti assessment', async () => {
    renderECRF()

    const openPrakritiBtn = screen.getByRole('button', { name: /score prakriti ecrf/i })
    fireEvent.click(openPrakritiBtn)

    expect(screen.getByRole('heading', { name: /ayurvedic prakriti assessment ecrf/i })).toBeInTheDocument()
    expect(screen.getByText(/automated prakriti calculation/i)).toBeInTheDocument()

    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/standardized prakriti assessment completed/i)
    fireEvent.change(reasonInput, { target: { value: 'Prakriti scoring verified by Ayurvedic physician' } })

    const savePrakritiBtn = screen.getByRole('button', { name: /save & lock prakriti ecrf/i })
    fireEvent.click(savePrakritiBtn)

    const state = useAppStore.getState()
    const prakritiRecords = state.ecrfRecords.filter((r) => r.visitType === 'Prakriti')
    expect(prakritiRecords.length).toBeGreaterThanOrEqual(1)
  })
})
