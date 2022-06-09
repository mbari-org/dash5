import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ReassignmentModal, ReassignmentModalProps } from './ReassignmentModal'
import { ReassignmentFormValues, Vehicles } from '../Forms/ReassignmentForm'
import { wait } from '@mbari/utils'
import { action } from '@storybook/addon-actions'

export default {
  title: 'Modals/ReassignmentModal',
  component: ReassignmentModal,
  args: {
    onCancel: action('cancel'),
    onConfirm: action('confirm'),
  },
} as Meta<ReassignmentModalProps>

const vehicles: Vehicles = [
  {
    vehicleId: 1200,
    vehicleName: 'Brizo',
    pic: 'Shannon Johnson',
    onCall: 'Brian Kieft',
  },
  {
    vehicleId: 1201,
    vehicleName: 'Aku',
    pic: 'Shannon Johnson',
    onCall: 'Brian Kieft',
  },
  {
    vehicleId: 1202,
    vehicleName: 'Pontus',
    pic: 'Shannon Johnson',
    onCall: 'Brian Kieft',
  },
]

const pilots = [
  { id: '1102', name: 'Carlos Rueda' },
  { id: '1103', name: 'Karen Salemy' },
]

const Template: Story<ReassignmentModalProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: ReassignmentFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return <ReassignmentModal {...args} onSubmit={onSubmit} loading={loading} />
}

const args: ReassignmentModalProps = {
  vehicles,
  open: true,
  pics: pilots,
  onCalls: pilots,
  onSubmit: async (values: ReassignmentFormValues) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A709',
  },
}
