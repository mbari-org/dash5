import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { wait } from '@mbari/utils'
import {
  ForgotPasswordModal,
  ForgotPasswordModalProps,
} from './ForgotPasswordModal'
import { ForgotPasswordFormValues } from '../Forms/ForgotPasswordForm'

export default {
  title: 'Modals/ForgotPasswordModal',
  component: ForgotPasswordModal,
  args: {
    open: true,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://user-images.githubusercontent.com/9150/172894249-20d34315-7274-4604-b6d2-8a05e250cca4.png',
    },
  },
} as Meta<ForgotPasswordModalProps>

const Template: Story<ForgotPasswordModalProps> = (args) => (
  <ForgotPasswordModal {...args} />
)

export const Standard = Template.bind({})
Standard.args = {
  onSubmit: async (values: ForgotPasswordFormValues) => {
    await wait(1)
    return undefined
  },
  onClose: action('close'),
}
