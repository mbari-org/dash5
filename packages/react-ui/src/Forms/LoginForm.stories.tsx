import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { LoginForm, LoginFormProps, LoginFormValues } from './LoginForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Forms/LoginForm',
} as Meta

const Template: Story<LoginFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: LoginFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <LoginForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: LoginFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: { email: 'admin@example.com', password: '123456789' },
}

export const Primary = Template.bind({})
Primary.args = args
