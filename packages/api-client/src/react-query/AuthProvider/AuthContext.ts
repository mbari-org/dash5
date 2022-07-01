import { AxiosInstance } from 'axios'
import { GetInfoResponse } from '../../axios'
import React from 'react'

export interface AuthContextProfile {
  token?: string
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  roles?: string[]
}

export interface AuthContextProviderProps {
  token?: string
  error?: string
  loading?: boolean
  authenticated?: boolean
  login: (email: string, password: string) => void
  profile?: AuthContextProfile
  logout: () => void
  axiosInstance?: AxiosInstance
  siteConfig?: GetInfoResponse
}

const defaultContext: AuthContextProviderProps = {
  authenticated: false,
  loading: false,
  login: () => {
    console.log('event fired')
  },
  logout: () => {
    console.log('event fired')
  },
}

export const AuthContext = React.createContext(defaultContext)
