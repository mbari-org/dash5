import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  NewDeploymentForm,
  NewDeploymentFormProps,
  NewDeploymentFormValues,
} from './NewDeploymentForm'
import { wait } from '@mbari/utils'
import { DateTime } from 'luxon'

export default {
  title: 'Forms/NewDeploymentForm',
} as Meta

const Template: Story<NewDeploymentFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: NewDeploymentFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <NewDeploymentForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: NewDeploymentFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: {
    startTime: DateTime.local().toISO(),
  },
}

export const Primary = Template.bind({})
Primary.args = args
