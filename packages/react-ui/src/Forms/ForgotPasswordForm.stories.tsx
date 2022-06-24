import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  ForgotPasswordForm,
  ForgotPasswordFormProps,
  ForgotPasswordFormValues,
} from './ForgotPasswordForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Forms/ForgotPasswordForm',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://user-images.githubusercontent.com/9150/172894249-20d34315-7274-4604-b6d2-8a05e250cca4.png',
    },
  },
} as Meta

const Template: Story<ForgotPasswordFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: ForgotPasswordFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <ForgotPasswordForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: ForgotPasswordFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: { email: 'example' },
}

export const Primary = Template.bind({})
Primary.args = args
