import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { LoginScreen } from './LoginScreen'
import { useAppStore } from '../store/appStore'

function renderLogin() {
  return render(
    <BrowserRouter>
      <LoginScreen />
    </BrowserRouter>,
  )
}

describe('LoginScreen enhanced authentication', () => {
  it('renders email and password inputs, 9 persona cards, Indian hosting badge, and footer', () => {
    renderLogin()

    expect(screen.getByLabelText(/clinical email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByText(/data hosted in india \(design intent\)/i)).toBeInTheDocument()
    expect(screen.getByText(/prototype\. synthetic data\. does not file with ctri\/cdsco\./i)).toBeInTheDocument()

    // 9 Persona roles
    expect(screen.getAllByText('Principal Investigator').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Study Coordinator').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Monitor (CRA)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Ethics Committee (IEC)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PV Officer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('DSMB').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Leadership').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Regulator').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
  })

  it('updates email when clicking different persona cards', () => {
    renderLogin()

    const emailInput = screen.getByLabelText(/clinical email/i) as HTMLInputElement
    expect(emailInput.value).toBe('ananya.patel@aiia.in')

    const coordinatorCard = screen.getByText('Study Coordinator').closest('button')!
    fireEvent.click(coordinatorCard)

    expect(emailInput.value).toBe('nisha.rao@aiia.in')
  })

  it('supports new user request design preview form without persisting', () => {
    renderLogin()

    const requestLink = screen.getByText(/new user request/i)
    fireEvent.click(requestLink)

    expect(screen.getByRole('heading', { name: /new user request/i })).toBeInTheDocument()
    expect(screen.getByText(/design preview only - does not create real account/i)).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/institutional email/i)

    fireEvent.change(nameInput, { target: { value: 'Dr. Suresh Kumar' } })
    fireEvent.change(emailInput, { target: { value: 'suresh.kumar@aiia.in' } })

    fireEvent.click(screen.getByText('Submit request'))

    expect(screen.getByText(/request submitted for review/i)).toBeInTheDocument()
    expect(screen.getByText(/note: this is a design preview only - does not create real account\./i)).toBeInTheDocument()

    // Return to sign in
    fireEvent.click(screen.getByText(/return to sign in/i))
    expect(screen.getByRole('heading', { name: /clinical sign in/i })).toBeInTheDocument()
  })

  it('navigates through mock 2FA / MFA step to authenticate user', () => {
    renderLogin()

    // Pick PV Officer
    const pvCard = screen.getByText('PV Officer').closest('button')!
    fireEvent.click(pvCard)

    // Click Continue to MFA
    const continueBtn = screen.getByText(/continue to mfa/i).closest('button')!
    fireEvent.click(continueBtn)

    // Verify MFA step
    expect(screen.getByRole('heading', { name: /two-factor authentication/i })).toBeInTheDocument()
    const mfaInput = screen.getByLabelText(/6-digit verification code/i)
    expect(mfaInput).toBeInTheDocument()

    // Enter code and submit
    fireEvent.change(mfaInput, { target: { value: '998877' } })
    fireEvent.click(screen.getByText(/verify mfa & sign in/i).closest('button')!)

    // Active user should now be updated in store
    const state = useAppStore.getState()
    expect(state.activeRole).toBe('PV Officer')
    expect(state.activeUserId).toBe('u5')
  })
})
