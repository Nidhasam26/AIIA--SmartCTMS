import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ESignatureModal } from './ESignatureModal'
import { useAppStore } from '../store/appStore'

describe('ESignatureModal Component', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeRole: 'Principal Investigator',
      activeUserId: 'u1',
      auditEntries: [],
    })
  })

  it('renders signer identity, role, and confirmation statement', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ESignatureModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        entityName="AdverseEvent"
        recordId="AE-004"
        title="Electronic Signature - SAE Intake"
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Electronic Signature - SAE Intake')).toBeInTheDocument()
    expect(screen.getByText(/Signer:/)).toBeInTheDocument()
    expect(screen.getByText('Dr. Ananya Patel')).toBeInTheDocument()
    expect(screen.getByText(/Principal Investigator/)).toBeInTheDocument()
    expect(screen.getByText(/By signing, I confirm this record is accurate as of/)).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(screen.getByLabelText('Signature reason')).toBeInTheDocument()
  })

  it('requires password and displays validation error when empty', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ESignatureModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        entityName="AdverseEvent"
        recordId="AE-004"
      />
    )

    const signButton = screen.getByRole('button', { name: /Sign and Finalize Record/i })
    fireEvent.click(signButton)

    expect(await screen.findByText(/Password re-entry is required/i)).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('accepts password, executes onConfirm, and writes hash-chained audit log', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ESignatureModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        entityName="AdverseEvent"
        recordId="AE-004"
        defaultReason="Filing verified serious adverse event"
      />
    )

    const passwordInput = screen.getByLabelText('Confirm password')
    fireEvent.change(passwordInput, { target: { value: 'demoPassword123' } })

    const signButton = screen.getByRole('button', { name: /Sign and Finalize Record/i })
    fireEvent.click(signButton)

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    const auditEntries = useAppStore.getState().auditEntries
    expect(auditEntries.length).toBeGreaterThan(0)
    const latestEntry = auditEntries[auditEntries.length - 1]
    expect(latestEntry.entity).toBe('AdverseEvent:AE-004')
    expect(latestEntry.action).toBe('ELECTRONIC_SIGNATURE')
    expect(latestEntry.actor).toBe('Principal Investigator')
    expect(latestEntry.hash).toBeDefined()
    expect(latestEntry.prevHash).toBeDefined()
    expect(latestEntry.newValue).toContain('Dr. Ananya Patel')
    expect(latestEntry.newValue).toContain('By signing, I confirm this record is accurate as of')
  })
})
