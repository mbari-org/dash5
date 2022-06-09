import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  CreateAccountModal,
  CreateAccountModalProps,
} from './CreateAccountModal'
import { wait } from '@mbari/utils'
import {
  CreateAccountFormProps,
  CreateAccountFormValues,
} from '../Forms/CreateAccountForm'

export default {
  title: 'Modals/CreateAccountModal',
  component: CreateAccountModal,
  args: {
    open: true,
  },
} as Meta<CreateAccountFormProps>

const Template: Story<CreateAccountModalProps> = (args) => (
  <CreateAccountModal {...args} />
)

export const Standard = Template.bind({})
Standard.args = {
  onSubmit: async (values: CreateAccountFormValues) => {
    await wait(1)
    return undefined
  },
}
