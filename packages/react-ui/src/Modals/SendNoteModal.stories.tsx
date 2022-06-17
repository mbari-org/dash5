import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { SendNoteModal, SendNoteModalProps } from './SendNoteModal'
import { SendNoteFormValues } from '../Forms/SendNoteForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Modals/SendNoteModal',
  component: SendNoteModal,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A465',
    },
  },
} as Meta

const Template: Story<SendNoteModalProps> = (args) => {
  const onSubmit: any = async (values: SendNoteFormValues) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  }

  return <SendNoteModal {...args} onSubmit={onSubmit} />
}

export const Standard = Template.bind({})
Standard.args = {
  vehicleName: 'Brizo',
  open: true,
  onClose: action('close'),
}
