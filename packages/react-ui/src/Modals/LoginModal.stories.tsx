import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { LoginModal, LoginModalProps } from './LoginModal'
import { wait } from '@mbari/utils'

export default {
  title: 'Modals/LoginModal',
  component: LoginModal,
} as Meta

const Template: Story<LoginModalProps> = (args) => {
  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setLoading(true)
    await wait(1)
    console.log('Submitted')
    setLoading(false)
    return undefined
  }
  return <LoginModal {...args} onSubmit={handleLogin} loading={loading} />
}

const args: LoginModalProps = {
  open: true,
  onSubmit: async () => undefined,
  onForgotPass: () => undefined,
  onCreateAcct: () => undefined,
  onCancel: () => undefined,
  onClose: () => undefined,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2104%3A543',
  },
}
