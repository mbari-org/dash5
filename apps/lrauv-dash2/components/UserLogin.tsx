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
      // SSO entry point — only shown when the user has no active MSAL session.
      ssoLabel={isMsalAuthenticated ? undefined : 'Sign in with MBARI SSO'}
      onSsoClick={isMsalAuthenticated ? undefined : () => msalLogin()}
    />
  )
}
