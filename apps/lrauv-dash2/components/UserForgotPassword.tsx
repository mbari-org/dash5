import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useResetPassword } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { ForgotPasswordModal, ForgotPasswordFormValues } from '@mbari/react-ui'

const UserForgotPassword: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const {
    mutate: resetPassword,
    isLoading,
    isError,
    error,
    isSuccess,
    data,
  } = useResetPassword({})

  const handleSubmit: AsyncSubmitHandler<ForgotPasswordFormValues> = async (
    values
  ) => {
    await resetPassword(values)
    return undefined
  }

  useEffect(() => {
    if (!isLoading && isError) {
      toast.error(
        (error as Error)?.message ?? 'Could not process your reset request.'
      )
    }
  }, [isLoading, isError, error])

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success(
        data?.message ??
          'A link to reset your password has been sent if an account with the specified email address exists.'
      )
      handleClose?.()
    }
  }, [isLoading, isSuccess, data, handleClose])

  return (
    <ForgotPasswordModal
      onSubmit={handleSubmit}
      loading={isLoading}
      onClose={handleClose}
      open
    />
  )
}

export default UserForgotPassword
