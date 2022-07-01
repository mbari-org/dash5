import { AxiosInstance } from 'axios'
import { GetInfoResponse } from '../../axios'
import React from 'react'

export interface TethysApiContextProfile {
  token?: string
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  roles?: string[]
}

export interface TethysApiContextProviderProps {
  token?: string
  error?: string
  loading?: boolean
  authenticated?: boolean
  login: (email: string, password: string) => void
  profile?: TethysApiContextProfile
  logout: () => void
  axiosInstance?: AxiosInstance
  siteConfig?: GetInfoResponse
}

const defaultContext: TethysApiContextProviderProps = {
  authenticated: false,
  loading: false,
  login: () => {
    console.log('event fired')
  },
  logout: () => {
    console.log('event fired')
  },
}

export const TethysApiContext = React.createContext(defaultContext)
