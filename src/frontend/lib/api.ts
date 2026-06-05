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

// ── sharing ───────────────────────────────────────────────────────────────────
export interface Share {
  id: string
  note_id: string
  token: string
  permission: 'view' | 'edit'
  shared_with_user_id?: string | null
  has_password: boolean
  expires_at?: string | null
  created_at: string
}

export interface CreateShareInput {
  permission: 'view' | 'edit'
  shared_with_username?: string
  password?: string
  expires_in_days?: number
}

export async function createShare(noteId: string, input: CreateShareInput): Promise<Share> {
  return request(`${NOTES}/v1/notes/${noteId}/share`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  }, 'notes')
}

export async function listShares(noteId: string): Promise<Share[]> {
  const data = await request(`${NOTES}/v1/notes/${noteId}/shares`, { headers: authHeaders() }, 'notes')
  return data.shares ?? []
}

export async function revokeShare(noteId: string, shareId: string): Promise<void> {
  await request(`${NOTES}/v1/notes/${noteId}/shares/${shareId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }, 'notes')
}

export interface SharedNoteResult {
  note: ApiNote
  permission: 'view' | 'edit'
  owner_id: string
}

// Open a shared note via its public token. Sends the JWT if signed in
// (needed for person-specific shares) and the password if one is set.
export async function getSharedNote(token: string, password?: string): Promise<SharedNoteResult> {
  const headers: Record<string, string> = {}
  const jwt = getToken()
  if (jwt) headers.Authorization = `Bearer ${jwt}`
  if (password) headers['X-Share-Password'] = password
  const res = await fetch(`${NOTES}/v1/shared/${token}`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new ApiError(data.error || 'Could not open this note', res.status)
    ;(err as ApiError & { needsPassword?: boolean }).needsPassword = !!data.needs_password
    throw err
  }
  return data
}

export async function updateSharedNote(token: string, patch: Partial<ApiNote>, password?: string): Promise<ApiNote> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const jwt = getToken()
  if (jwt) headers.Authorization = `Bearer ${jwt}`
  if (password) headers['X-Share-Password'] = password
  const res = await fetch(`${NOTES}/v1/shared/${token}`, { method: 'PUT', headers, body: JSON.stringify(patch) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Could not save', res.status)
  return data
}

export interface SharedWithMe { token: string; permission: 'view' | 'edit'; note: ApiNote }

export async function listSharedWithMe(): Promise<SharedWithMe[]> {
  const data = await request(`${NOTES}/v1/shared-with-me`, { headers: authHeaders() }, 'notes')
  return data.shared ?? []
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
