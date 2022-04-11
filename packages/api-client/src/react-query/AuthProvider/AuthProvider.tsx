import React from 'react'
import { useCreateLogin } from '../User/useCreateLogin'
import { AuthContext } from './AuthContext'

export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()

  const loginUser = useCreateLogin()
  const login = React.useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginUser.mutateAsync({ email, password })
        setToken(response.token)
        setError(undefined)
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [setToken, setError, loginUser]
  )

  const logout = React.useCallback(() => {
    setToken(undefined)
    setError(undefined)
  }, [setToken, setError])

  return (
    <AuthContext.Provider
      value={{
        login,
        token,
        logout,
        error,
        authenticated: token?.length ?? 0 ? true : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
