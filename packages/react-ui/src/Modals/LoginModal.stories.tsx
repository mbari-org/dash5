import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { LoginModal, LoginModalProps } from './LoginModal'

export default {
  title: 'Modals/LoginModal',
  component: LoginModal,
} as Meta

const Template: Story<LoginModalProps> = (args) => <LoginModal {...args} />

const args: LoginModalProps = {
  open: true,
  onSubmit: async () => undefined,
  onForgotPass: () => {},
  onCreateAcct: () => {},
  onCancel: () => {},
  onClose: () => {},
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2104%3A543',
  },
}