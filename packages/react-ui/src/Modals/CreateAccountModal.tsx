import React from 'react'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import {
  CreateAccountForm,
  CreateAccountFormValues,
} from '../Forms/CreateAccountForm'
import { Modal, ModalPropsWithoutTitle } from '../Modal'

export interface CreateAccountModalProps extends ModalPropsWithoutTitle {
  onSubmit: AsyncSubmitHandler<CreateAccountFormValues>
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  onSubmit,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps} title="Create account" form="createAccount">
      <CreateAccountForm onSubmit={onSubmit} id="createAccount" hideSubmit />
    </Modal>
  )
}

CreateAccountModal.displayName = 'Components.CreateAccountModal'
