import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StudyDetailPage } from './StudyDetailPage'
import { useAppStore } from '../../store/appStore'

describe('study change reason dialog and study tabs', () => {
  beforeEach(() => useAppStore.getState().resetDemoData())

  function renderStudy(studyId = 'study-1') {
    return render(
      <MemoryRouter initialEntries={[`/study/${studyId}`]}>
        <Routes><Route path="/study/:studyId" element={<StudyDetailPage />} /></Routes>
      </MemoryRouter>,
    )
  }

  it('blocks saving without a reason and records a supplied reason', async () => {
    renderStudy()
    fireEvent.click(screen.getByRole('button', { name: 'Edit study' }))
    fireEvent.change(screen.getByLabelText('Study title'), { target: { value: 'Updated study title' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save change' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a reason for this change')
    expect(useAppStore.getState().studies.find((study) => study.id === 'study-1')?.title).not.toBe('Updated study title')

    fireEvent.change(screen.getByLabelText(/Reason for change/), { target: { value: 'Corrected title per approved protocol amendment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save change' }))
    await waitFor(() => {
      expect(useAppStore.getState().studies.find((study) => study.id === 'study-1')?.title).toBe('Updated study title')
    })
    expect(useAppStore.getState().studyChangeReasons['study-1']).toBe('Corrected title per approved protocol amendment')
  })

  it('renders all tabs and switches between them showing store data', () => {
    renderStudy('study-1')
    expect(screen.getByRole('tab', { name: /Overview/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Lifecycle/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Ethics & CTRI/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Safety/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Deviations/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Queries/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Audit/ })).toBeInTheDocument()

    // Click Lifecycle tab and verify completed, current, and upcoming stages
    fireEvent.click(screen.getByRole('tab', { name: /Lifecycle/ }))
    expect(screen.getByText('Study lifecycle stepper')).toBeInTheDocument()
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Current').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0)

    // Click Safety tab
    fireEvent.click(screen.getByRole('tab', { name: /Safety/ }))
    expect(screen.getByText(/Adverse events and safety signals/)).toBeInTheDocument()
    expect(screen.getByText('Severe abdominal pain following formulation intake')).toBeInTheDocument()

    // Click Deviations tab
    fireEvent.click(screen.getByRole('tab', { name: /Deviations/ }))
    expect(screen.getByText(/Protocol deviations/)).toBeInTheDocument()
    expect(screen.getByText('Visit completed outside protocol window')).toBeInTheDocument()

    // Click Queries tab
    fireEvent.click(screen.getByRole('tab', { name: /Queries/ }))
    expect(screen.getByText(/Data queries/)).toBeInTheDocument()
    expect(screen.getByText('Dose timing')).toBeInTheDocument()

    // Click Audit tab
    fireEvent.click(screen.getByRole('tab', { name: /Audit/ }))
    expect(screen.getByText(/Study audit trail/)).toBeInTheDocument()
    expect(screen.getByText('Initial seed creation')).toBeInTheDocument()
  })
})