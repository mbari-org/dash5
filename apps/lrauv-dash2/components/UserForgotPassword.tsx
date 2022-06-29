import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { ForgotPasswordModal, ForgotPasswordFormValues } from '@mbari/react-ui'

const UserForgotPassword: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { login, loading, error } = useAuthContext()

  const handleSubmit: AsyncSubmitHandler<ForgotPasswordFormValues> = async (
    values
  ) => {
    await login(values.email, values.password)
    return undefined
  }

  useEffect(() => {
    if (!loading && error) {
      toast.error(error)
    }
  }, [loading, error])

  return (
    <ForgotPasswordModal
      onSubmit={handleSubmit}
      loading={loading}
      onClose={handleClose}
      open
    />
  )
}

export default UserForgotPassword
