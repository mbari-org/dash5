import React from 'react'

export interface AuthContextProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  roles: string[]
}

export interface AuthContextProviderProps {
  token?: string
  error?: string
  loading?: boolean
  authenticated?: boolean
  login: (email: string, password: string) => void
  profile?: AuthContextProfile
  logout: () => void
}

const defaultContext: AuthContextProviderProps = {
  authenticated: false,
  loading: false,
  login: () => {},
  logout: () => {},
}

export const AuthContext = React.createContext(defaultContext)
