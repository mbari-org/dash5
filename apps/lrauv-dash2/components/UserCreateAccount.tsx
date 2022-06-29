import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { CreateAccountModal, CreateAccountFormValues } from '@mbari/react-ui'

const UserCreateAccount: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { login, loading, error } = useAuthContext()

  const handleSubmit: AsyncSubmitHandler<CreateAccountFormValues> = async (
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
    <CreateAccountModal
      onSubmit={handleSubmit}
      loading={loading}
      onClose={handleClose}
      open
    />
  )
}

export default UserCreateAccount
