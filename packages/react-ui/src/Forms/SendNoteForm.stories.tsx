import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  SendNoteForm,
  SendNoteFormProps,
  SendNoteFormValues,
} from './SendNoteForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Forms/SendNoteForm',
  component: SendNoteForm,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A465',
    },
  },
} as Meta

const Template: Story<SendNoteFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: SendNoteFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <SendNoteForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: SendNoteFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: { note: 'example', bugReport: true, critical: true },
}

export const Primary = Template.bind({})
Primary.args = args
