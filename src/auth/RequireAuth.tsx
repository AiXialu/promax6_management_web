import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from './auth'

export default function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation()
  if (isLoggedIn()) return children

  const redirect = `${location.pathname}${location.search}${location.hash}`
  return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
}

