import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { useAppStore } from '../store/appStore'

const roleCases = [
  ['Principal Investigator', ['Dashboard', 'Study registry', 'Safety board', 'Data exports']],
  ['Study Coordinator', ['Dashboard', 'Study registry', 'Data exports']],
  ['Monitor (CRA)', ['Dashboard', 'Study registry']],
  ['Ethics Committee (IEC)', ['Dashboard', 'Study registry', 'Safety board']],
  ['PV Officer', ['Dashboard', 'Safety board']],
  ['DSMB', ['Dashboard', 'Safety board']],
  ['Leadership', ['Dashboard', 'Study registry', 'Safety board', 'Audit trail']],
  ['Regulator', ['Dashboard', 'Study registry', 'Data exports', 'Audit trail']],
  ['System Admin', ['Dashboard', 'Study registry', 'Data exports', 'Audit trail', 'Administration']],
] as const

describe('AppShell persona sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAppStore.getState().resetDemoData()
  })

  it.each(roleCases)('%s renders only its permitted sidebar items', (role, expected) => {
    useAppStore.getState().setActiveRole(role)
    render(<MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<AppShell />}><Route index element={<div>Dashboard content</div>} /></Route></Routes></MemoryRouter>)
    const nav = within(screen.getByRole('navigation'))
    expect(nav.getAllByRole('button').map((button) => button.textContent)).toEqual(expected)
  })
})