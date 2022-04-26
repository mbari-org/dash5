import React from 'react'
import clsx from 'clsx'
import { Modal, ModalProps } from '../Modal'
import { LoginForm, LoginFormValues } from '../Forms'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { swallow } from '@mbari/utils'

type ModalPropsWithoutTitle = Omit<ModalProps, 'title'>

const styles = {
  title: 'pl-2 text-xl',
  forgotBtn: 'pl-2 text-sm text-primary-600',
  createContainer: 'flex w-full items-end justify-center pt-8',
  noAcctText: 'text-stone-600 opacity-60 mr-1',
  createBtn: 'text-primary-600',
  lightSans: 'font-sans font-light',
}

export interface LoginModalProps extends ModalPropsWithoutTitle {
  onSubmit: AsyncSubmitHandler<LoginFormValues>
  onForgotPass: () => void
  onCreateAcct: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onSubmit,
  onForgotPass,
  onCreateAcct,
  ...modalProps
}) => {
  return (
    <Modal
      form="LoginModalForm"
      confirmButtonText="Log in"
      title={<div className={styles.title}>Log In</div>}
      {...modalProps}
    >
      <div className="pt-2">
        <LoginForm id="LoginModalForm" hideSubmit onSubmit={onSubmit} />
        <button
          className={clsx(styles.forgotBtn, styles.lightSans)}
          onClick={swallow(onForgotPass)}
        >
          Forgot password?
        </button>
        <div className={styles.createContainer}>
          <span className={clsx(styles.noAcctText, styles.lightSans)}>
            Don't have an account?
          </span>
          <button
            className={clsx(styles.createBtn, styles.lightSans)}
            onClick={swallow(onCreateAcct)}
          >
            Create account
          </button>
        </div>
      </div>
    </Modal>
  )
}

LoginModal.displayName = 'Modals.LoginModal'
