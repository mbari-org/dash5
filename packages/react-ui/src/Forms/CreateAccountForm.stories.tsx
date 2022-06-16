import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  CreateAccountForm,
  CreateAccountFormProps,
  CreateAccountFormValues,
} from './CreateAccountForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Forms/CreateAccountForm',
} as Meta

const Template: Story<CreateAccountFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: CreateAccountFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <CreateAccountForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: CreateAccountFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: { email: 'admin@example.com', password: '123456789' },
}

export const Primary = Template.bind({})
Primary.args = args
