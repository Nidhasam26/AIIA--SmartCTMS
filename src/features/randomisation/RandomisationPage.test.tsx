import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RandomisationPage } from './RandomisationPage'
import { useAppStore } from '../../store/appStore'

function renderRandomisation() {
  return render(
    <MemoryRouter>
      <RandomisationPage />
    </MemoryRouter>
  )
}

describe('RandomisationPage & Arm Allocation Engine', () => {
  beforeEach(() => {
    useAppStore.getState().resetDemoData()
  })

  it('renders randomisation interface, arm balance cards, and participant form', () => {
    renderRandomisation()

    expect(screen.getByRole('heading', { name: /subject randomisation & stratification engine/i })).toBeInTheDocument()
    expect(screen.getByText(/total enrolled/i)).toBeInTheDocument()
    expect(screen.getAllByText(/ayurvedic intervention/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/standard of care/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/placebo control/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /enroll & allocate arm/i })).toBeInTheDocument()
  })

  it('enrolls and allocates participant to a treatment arm with kit generation and audit trail', async () => {
    renderRandomisation()

    const subjectInput = screen.getByPlaceholderText(/e\.g\. pt-000189/i)
    fireEvent.change(subjectInput, { target: { value: 'PT-NEW-999' } })

    const enrollBtn = screen.getByRole('button', { name: /enroll & allocate arm/i })
    fireEvent.click(enrollBtn)

    await waitFor(() => {
      expect(screen.getByText(/successfully allocated/i)).toBeInTheDocument()
    })

    const state = useAppStore.getState()
    const foundRecord = state.randomisationRecords.find((r) => r.subjectId === 'PT-NEW-999')
    expect(foundRecord).toBeDefined()
    expect(['Ayurvedic Intervention', 'Standard of Care', 'Placebo Control']).toContain(foundRecord?.allocatedArm)
    expect(foundRecord?.kitCode).toMatch(/^KIT-/)

    // Check audit trail
    const auditEntry = state.auditEntries.find((a) => a.entity.includes('PT-NEW-999'))
    expect(auditEntry).toBeDefined()
  })

  it('prevents duplicate randomisation for already registered subject', async () => {
    renderRandomisation()

    const subjectInput = screen.getByPlaceholderText(/e\.g\. pt-000189/i)
    fireEvent.change(subjectInput, { target: { value: 'PT-000124' } }) // already in seed for study-1

    const enrollBtn = screen.getByRole('button', { name: /enroll & allocate arm/i })
    fireEvent.click(enrollBtn)

    await waitFor(() => {
      expect(screen.getByText(/already randomised/i)).toBeInTheDocument()
    })
  })
})
