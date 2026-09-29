export const SESSION_TIMEOUT_MS = 15 * 60 * 1000
export const SESSION_WARNING_MS = 2 * 60 * 1000

export function startSessionTimeout(
  onWarning: () => void,
  onTimeout: () => void,
  timeoutMs = SESSION_TIMEOUT_MS,
  warningMs = SESSION_WARNING_MS,
) {
  let warningTimer = 0
  let timeoutTimer = 0

  const reset = () => {
    window.clearTimeout(warningTimer)
    window.clearTimeout(timeoutTimer)
    warningTimer = window.setTimeout(onWarning, Math.max(0, timeoutMs - warningMs))
    timeoutTimer = window.setTimeout(onTimeout, timeoutMs)
  }

  const stop = () => {
    window.clearTimeout(warningTimer)
    window.clearTimeout(timeoutTimer)
  }

  reset()
  return { reset, stop }
}