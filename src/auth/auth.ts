import { useEffect, useState } from 'react'
import { clearPrivateConfig, getPrivateConfig, setPrivateConfig } from '../data/config'

const AUTH_EVENT_NAME = 'promax-auth-changed'

export function isLoggedIn(): boolean {
  return !!getPrivateConfig().token
}

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
}

export function login(token: string): boolean {
  const t = token.trim()
  if (!t) return false
  setPrivateConfig({ token: t })
  emitAuthChanged()
  return true
}

export function logout() {
  clearPrivateConfig()
  emitAuthChanged()
}

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(() => isLoggedIn())

  useEffect(() => {
    const onChange = () => setAuthed(isLoggedIn())
    window.addEventListener(AUTH_EVENT_NAME, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  return { isLoggedIn: authed }
}

