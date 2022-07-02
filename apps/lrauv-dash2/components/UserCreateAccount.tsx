import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateUser, useTethysApiContext } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { CreateAccountModal, CreateAccountFormValues } from '@mbari/react-ui'
import ReCAPTCHA, { ReCAPTCHAProps } from 'react-google-recaptcha'

const UserCreateAccount: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const { siteConfig } = useTethysApiContext()
  const [recaptchaResponse, setRecaptchaResponse] =
    useState<string | null | undefined>(null)
  const {
    mutate: createUser,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
  } = useCreateUser({})

  const handleSubmit: AsyncSubmitHandler<CreateAccountFormValues> = async ({
    requestOperator,
    ...values
  }) => {
    await createUser({
      ...values,
      requestedRoles: requestOperator ? 'operator' : '',
      recaptchaResponse: recaptchaResponse ?? '',
    })
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
        'Your account has been created. An administrator may need to approve any requested roles before they can take affect.'
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
          sitekey={siteConfig?.appConfig.recaptcha.siteKey ?? ''}
          onChange={setRecaptchaResponse}
        />
      </CreateAccountModal>
    </>
  )
}

export default UserCreateAccount
