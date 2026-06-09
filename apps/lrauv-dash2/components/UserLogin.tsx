import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTethysApiContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { LoginModal, LoginFormValues } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import { useMbariAuth } from '../lib/useMbariAuth'

export const UserLogin: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const { login, loading, error } = useTethysApiContext()
  const { login: msalLogin, isAuthenticated: isMsalAuthenticated } =
    useMbariAuth()

  const handleSubmit: AsyncSubmitHandler<LoginFormValues> = async (values) => {
    await login(values.email, values.password)
    return undefined
  }

  useEffect(() => {
    if (!loading && error) {
      toast.error(error)
    }
  }, [loading, error])

  const handleCreateAccount = () => setGlobalModalId({ id: 'signup' })
  const handleForgotPass = () => setGlobalModalId({ id: 'forgot' })

  return (
    <LoginModal
      onSubmit={handleSubmit}
      onForgotPass={handleForgotPass}
      onCreateAcct={handleCreateAccount}
      loading={loading}
      onClose={handleClose}
      open
      // Always show the SSO button so users can re-authenticate if the cached
      // MSAL session has a token acquisition failure (interaction required,
      // redirect URI mismatch, etc.) without needing to clear site data.
      ssoLabel={
        isMsalAuthenticated
          ? 'Re-authenticate with MBARI SSO'
          : 'Sign in with MBARI SSO'
      }
      onSsoClick={() => msalLogin()}
    />
  )
}
