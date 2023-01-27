import React from 'react'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import {
  CreateAccountForm,
  CreateAccountFormValues,
} from '../Forms/CreateAccountForm'
import { Modal, ModalPropsWithoutTitle } from '../Modal'

export interface CreateAccountModalProps extends ModalPropsWithoutTitle {
  onSubmit: AsyncSubmitHandler<CreateAccountFormValues>
  children?: React.ReactNode
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  onSubmit,
  children,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      title="Create account"
      confirmButtonText="Create Account"
      form="createAccount"
    >
      <CreateAccountForm onSubmit={onSubmit} id="createAccount" hideSubmit />
      {children}
    </Modal>
  )
}

CreateAccountModal.displayName = 'Components.CreateAccountModal'
