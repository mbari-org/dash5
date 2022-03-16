import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { Login, LoginProps, LoginValues } from './Login'
import { wait } from 'utils'

export default {
  title: 'Forms/Login',
} as Meta

const Template: Story<LoginProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: LoginValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <Login {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: LoginProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: { email: 'admin@example.com', password: '123456789' },
}

export const Primary = Template.bind({})
Primary.args = args
