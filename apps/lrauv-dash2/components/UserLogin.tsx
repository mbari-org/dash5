import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { LoginModal, LoginFormValues } from '@mbari/react-ui'

export const UserLogin: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { login, loading, error } = useAuthContext()

  const handleForgotPass = () => {
    console.log('Forgot password')
  }
  const handleSubmit: AsyncSubmitHandler<LoginFormValues> = async (values) => {
    await login(values.email, values.password)
    return undefined
  }

  useEffect(() => {
    if (!loading && error) {
      toast.error(error)
    }
  }, [loading, error])

  const handleCreateAccount = () => undefined

  return (
    <LoginModal
      onSubmit={handleSubmit}
      onForgotPass={handleForgotPass}
      onCreateAcct={handleCreateAccount}
      loading={loading}
      onClose={handleClose}
      open
    />
  )
}
