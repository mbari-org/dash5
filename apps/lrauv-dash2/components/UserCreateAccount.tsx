import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateUser, useTethysApiContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { CreateAccountModal, CreateAccountFormValues } from '@mbari/react-ui'
import ReCAPTCHA from 'react-google-recaptcha'

const UserCreateAccount: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { siteConfig } = useTethysApiContext()
  const [recaptchaResponse, setRecaptchaResponse] =
    useState<string | null>(null)
  const {
    mutate: createUser,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
  } = useCreateUser({})

  const handleSubmit: AsyncSubmitHandler<CreateAccountFormValues> = async (
    values
  ) => {
    await createUser({ ...values, recaptchaResponse })
    return undefined
  }

  useEffect(() => {
    if (!isLoading && isError) {
      toast.error(error?.message ?? 'Could not process your reset request.')
    }
  }, [isLoading, isError, error])

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success(
        data?.result.message ??
          'A link to reset your password has been sent if an account with the specified email address exists.'
      )
      handleClose?.()
    }
  }, [isLoading, isSuccess, data, handleClose])

  return (
    <>
      <CreateAccountModal
        onSubmit={handleSubmit}
        loading={isLoading}
        onClose={handleClose}
        open
        disableConfirm={!recaptchaResponse}
      >
        <ReCAPTCHA
          sitekey={siteConfig?.appConfig.recaptcha.siteKey}
          onChange={setRecaptchaResponse}
        />
      </CreateAccountModal>
    </>
  )
}

export default UserCreateAccount
