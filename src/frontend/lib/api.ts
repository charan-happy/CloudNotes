// Central API client for the CloudNotes backend microservices.
// Token-based auth: the JWT from auth-service is sent as a Bearer header.

const AUTH = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const NOTES = process.env.NEXT_PUBLIC_NOTE_URL ?? 'http://localhost:8001'
const ANALYTICS = process.env.NEXT_PUBLIC_ANALYTICS_URL ?? 'http://localhost:8003'

export interface AuthResult {
  token: string
  user_id: string
  username: string
  email: string
}

export interface ApiNote {
  id: string
  user_id: string
  title: string
  content: unknown
  tags: string[]
  icon: string
  color: string
  cover?: string | null
  note_theme: string
  pinned: boolean
  created_at: string
  updated_at: string
}

// ── token helpers ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function saveSession(r: AuthResult) {
  localStorage.setItem('token', r.token)
  localStorage.setItem('username', r.username)
  localStorage.setItem('user_id', r.user_id)
  localStorage.setItem('email', r.email)
}

export function clearSession() {
  for (const k of ['token', 'username', 'user_id', 'email']) localStorage.removeItem(k)
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

// Turns any backend/network failure into a message a non-technical user understands.
function friendlyMessage(status: number, serverMsg: string, context: 'login' | 'register' | 'notes'): string {
  if (status === 0) return "We can't reach CloudNotes right now. Please check your internet connection and try again."
  if (status === 401) {
    return context === 'login'
      ? 'The username or password you entered is incorrect.'
      : 'Your session has expired. Please sign in again.'
  }
  if (status === 409) {
    if (/email/i.test(serverMsg)) return 'That email is already registered. Try signing in instead.'
    if (/username/i.test(serverMsg)) return 'That username is already taken. Please choose another.'
    return 'That account already exists.'
  }
  if (status === 400 || status === 422) {
    if (context === 'register') return 'Please check your details — username needs 3+ characters and password 8+ characters.'
    return 'Some information looks incorrect. Please review and try again.'
  }
  if (status === 405) return 'Something went wrong connecting to CloudNotes. Please refresh the page and try again.'
  if (status >= 500) return 'CloudNotes is having a temporary problem. Please try again in a moment.'
  return serverMsg || 'Something went wrong. Please try again.'
}

export class ApiError extends Error {
  status: number
  authError: boolean
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.authError = status === 401
  }
}

async function request(url: string, init: RequestInit, context: 'login' | 'register' | 'notes') {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    // Network-level failure (server down, DNS, CORS, offline).
    throw new ApiError(friendlyMessage(0, '', context), 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(friendlyMessage(res.status, data.detail || data.error || '', context), res.status)
  }
  return data
}

// ── auth ──────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<AuthResult> {
  return request(`${AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }, 'login')
}

export async function register(username: string, email: string, password: string): Promise<AuthResult> {
  return request(`${AUTH}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  }, 'register')
}

// ── notes ─────────────────────────────────────────────────────────────────────
export async function listNotes(): Promise<ApiNote[]> {
  const data = await request(`${NOTES}/v1/notes`, { headers: authHeaders() }, 'notes')
  return data.notes ?? []
}

export async function createNote(note: Partial<ApiNote>): Promise<ApiNote> {
  return request(`${NOTES}/v1/notes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(note),
  }, 'notes')
}

export async function updateNote(id: string, patch: Partial<ApiNote>): Promise<ApiNote> {
  return request(`${NOTES}/v1/notes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  }, 'notes')
}

export async function deleteNote(id: string): Promise<void> {
  await request(`${NOTES}/v1/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }, 'notes')
}

// ── analytics (fire-and-forget) ───────────────────────────────────────────────
export function track(eventType: string, payload: Record<string, unknown> = {}) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  fetch(`${ANALYTICS}/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, user_id: userId, payload }),
  }).catch(() => {}) // never block UI on analytics
}
