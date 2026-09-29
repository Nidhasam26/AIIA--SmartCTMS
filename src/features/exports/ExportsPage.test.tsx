import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExportsPage } from './ExportsPage'

describe('Exports page', () => {
  it('renders export controls', () => {
    render(<ExportsPage />)
    expect(screen.getByText('FHIR and SDTM exports')).toBeInTheDocument()
    expect(screen.getByText('FHIR bundle')).toBeInTheDocument()
    expect(screen.getByText('SDTM CSV')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download FHIR Bundle' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('requires SDTM integrity checks before enabling each domain CSV download', () => {
    render(<ExportsPage />)
    const domains = ['DM', 'AE', 'DS', 'EX', 'SV', 'DV', 'TS']
    for (const domain of domains) expect(screen.getByRole('link', { name: `Download ${domain} CSV` })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Run pre-export integrity checks' }))
    expect(screen.getByRole('status')).toHaveTextContent('SDTM integrity: passed for DM, AE, DS, EX, SV, DV, TS')
    for (const domain of domains) {
      expect(screen.getByRole('link', { name: `Download ${domain} CSV` })).toHaveAttribute('aria-disabled', 'false')
      expect(screen.getByRole('link', { name: `Download ${domain} CSV` })).toHaveAttribute('href')
    }
  })

  it('opens a FHIR conformance report for all mapped resource types', () => {
    render(<ExportsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Open FHIR conformance report' }))
    expect(screen.getByRole('status')).toHaveTextContent('FHIR bundle conformance passed.')
    expect(screen.getByText(/ResearchStudy, ResearchSubject, AdverseEvent, Consent/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download FHIR Bundle' })).toHaveAttribute('aria-disabled', 'false')
    expect(screen.getByRole('link', { name: 'Download FHIR Bundle' })).toHaveAttribute('href')
  })
})
