export type UserDto = {
  id: string
  firstName: string
  email: string
  username: string
  isDonor: boolean
  isAdmin: boolean
}

export type AuthResponse = {
  token: string
  user: UserDto
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5178'

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string }
    return body.message ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export async function apiRegister(input: {
  firstName: string
  email: string
  username: string
  password: string
  isDonor: boolean
  isAdmin: boolean
  adminCode?: string
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as AuthResponse
}

export async function apiLogin(input: {
  username: string
  password: string
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as AuthResponse
}

export async function apiGetMe(token: string): Promise<UserDto> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as UserDto
}

