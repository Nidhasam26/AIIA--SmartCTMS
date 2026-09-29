import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PortfolioPage } from './PortfolioPage'
import { useAppStore } from '../../store/appStore'

describe('portfolio filters', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAppStore.getState().resetDemoData()
  })

  it('filters by search, status, PI, department, phase, and site', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    const study1 = 'AYUSH-01: Polyherbal Anti-Inflammatory in Knee Osteoarthritis'
    const study2 = 'AYUSH-06: Rasayana for Functional Recovery in Post-Stroke Rehab'
    const study3 = 'AYUSH-10: Standardised Ashwagandha for Stress Biomarker Modulation'

    fireEvent.change(screen.getByLabelText('Search studies'), { target: { value: 'CTRI/2025/04' } })
    expect(screen.getByText(study2)).toBeInTheDocument()
    expect(screen.queryByText(study1)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Search studies'), { target: { value: '' } })

    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'At Risk' } })
    expect(screen.getByText(study1)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3 studies')
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: '' } })

    fireEvent.change(screen.getByLabelText('Filter by PI'), { target: { value: 'Dr. Neha Verma' } })
    expect(screen.getByText(study2)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filter by PI'), { target: { value: '' } })

    fireEvent.change(screen.getByLabelText('Filter by department'), { target: { value: 'Psychiatry' } })
    expect(screen.getByText(study3)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filter by department'), { target: { value: '' } })

    fireEvent.change(screen.getByLabelText('Filter by phase'), { target: { value: 'Phase III' } })
    expect(screen.getByText(study2)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filter by phase'), { target: { value: '' } })

    fireEvent.change(screen.getByLabelText('Filter by site'), { target: { value: 'IMC Bengaluru' } })
    expect(screen.getByText(study2)).toBeInTheDocument()
    expect(screen.queryByText(study1)).not.toBeInTheDocument()
  })

  it('shows an empty state and clears filters', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Search studies'), { target: { value: 'no matching study' } })
    expect(screen.getByText('Showing 0 of 3 studies')).toBeInTheDocument()
    expect(screen.getByText('No studies match these filters.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('Showing 3 of 3 studies')).toBeInTheDocument()
  })
})