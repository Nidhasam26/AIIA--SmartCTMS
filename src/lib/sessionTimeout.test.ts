import { afterEach, describe, expect, it, vi } from 'vitest'
import { startSessionTimeout } from './sessionTimeout'

describe('session timeout warning', () => {
  afterEach(() => vi.useRealTimers())

  it('warns before timeout, allows reset, and invokes timeout after inactivity', () => {
    vi.useFakeTimers()
    const onWarning = vi.fn()
    const onTimeout = vi.fn()
    const session = startSessionTimeout(onWarning, onTimeout, 1000, 250)

    vi.advanceTimersByTime(750)
    expect(onWarning).toHaveBeenCalledTimes(1)
    expect(onTimeout).not.toHaveBeenCalled()

    session.reset()
    vi.advanceTimersByTime(1000)
    expect(onTimeout).toHaveBeenCalledTimes(1)
    session.stop()
  })
})