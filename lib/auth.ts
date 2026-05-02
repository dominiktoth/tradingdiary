const AUTH_KEY = 'tradingDiaryAuthExpiresAt'
const AUTH_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(AUTH_KEY)
  if (!stored) return false
  const expiresAt = parseInt(stored, 10)
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    localStorage.removeItem(AUTH_KEY)
    return false
  }
  return true
}

export function setAuthenticated(): void {
  if (typeof window === 'undefined') return
  const expiresAt = Date.now() + AUTH_DURATION_MS
  localStorage.setItem(AUTH_KEY, expiresAt.toString())
}

export function clearAuthentication(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEY)
}
