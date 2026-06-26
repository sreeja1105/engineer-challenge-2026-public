import { API_URL, LLM_API_KEY } from './config'
import { FeedbackItem, User } from './types'

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error('Login failed')
  }
  return res.json()
}

export async function fetchInbox(
  page: number,
  status: string,
  token: string
): Promise<{ items: FeedbackItem[]; total: number; page: number }> {
  const res = await fetch(`${API_URL}/feedback?page=${page}&status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function fetchItem(id: number, token: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_URL}/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function toggleResolve(id: number, token: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_URL}/feedback/${id}/resolve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function summarize(id: number, token: string): Promise<{ summary: string }> {
  const res = await fetch(`${API_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-llm-key': LLM_API_KEY,
    },
    body: JSON.stringify({ id }),
  })
  return res.json()
}
