import React from 'react'
import { Modal, ModalPropsWithoutTitle } from '../Modal'
import {
  ForgotPasswordForm,
  ForgotPasswordFormValues,
} from '../Forms/ForgotPasswordForm'
import { AsyncSubmitHandler } from '@sumocreations/forms'

export interface ForgotPasswordModalProps extends ModalPropsWithoutTitle {
  onSubmit: AsyncSubmitHandler<ForgotPasswordFormValues>
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onSubmit,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      title="Reset Password"
      confirmButtonText="Reset"
      form="resetPassword"
    >
      <ForgotPasswordForm id="resetPassword" onSubmit={onSubmit} hideSubmit />
    </Modal>
  )
}

ForgotPasswordModal.displayName = 'Modals.ForgotPasswordModal'
