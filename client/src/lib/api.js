const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) {
    const message = data?.error?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data
}
