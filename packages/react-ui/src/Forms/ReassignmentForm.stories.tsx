import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  ReassignmentForm,
  ReassignmentFormProps,
  ReassignmentFormValues,
  Vehicles,
} from './ReassignmentForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Forms/ReassignmentForm',
  args: {
    hideSubmit: true,
  },
} as Meta<ReassignmentFormProps>

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

const Template: Story<ReassignmentFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: ReassignmentFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  return (
    <div className="rounded border p-4">
      <ReassignmentForm {...args} onSubmit={onSubmit} loading={loading} />
    </div>
  )
}

const args: ReassignmentFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  vehicles,
  pics: [],
  onCalls: [],
  disableOnCalls: false,
  disablePics: false,
}

export const Primary = Template.bind({})
Primary.args = args
