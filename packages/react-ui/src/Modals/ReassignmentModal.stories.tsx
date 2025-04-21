import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  ReassignmentModal,
  ReassignmentModalProps,
  RoleChangeType,
} from './ReassignmentModal'
import { action } from '@storybook/addon-actions'

export default {
  title: 'Modals/ReassignmentModal',
  component: ReassignmentModal,
  args: {
    onClose: action('close'),
  },
} as Meta<ReassignmentModalProps>

const vehicles = [
  {
    name: 'Brizo',
    picOperators: ['Norville Rogers', 'Daphne Blake'],
    onCallOperators: [],
  },
  {
    name: 'Aku',
    picOperators: ['Fred Jones'],
    onCallOperators: ['Brian Kieft'],
  },
  {
    name: 'Pontus',
    picOperators: ['Velma Dinkley'],
    onCallOperators: ['Brian Kieft'],
  },
]

const Template: Story<ReassignmentModalProps> = (args) => {
  const [isLoading, setIsLoading] = React.useState(args.isLoading ?? false)

  const handleRoleChange = (
    vehicleName: string,
    roleChangeType: RoleChangeType,
    isPic: boolean
  ) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      console.log(
        `Signed ${roleChangeType} for ${vehicleName} as ${
          isPic ? 'PIC' : 'On-Call'
        }`
      )
    }, 1000)
  }

  return (
    <ReassignmentModal
      {...args}
      isLoading={isLoading}
      onRoleChange={handleRoleChange}
    />
  )
}

const args: ReassignmentModalProps = {
  vehicles,
  open: true,
  currentUserName: 'John Doe',
  onRoleChange: (vehicleName, roleChangeType, isPic) =>
    console.log(
      `Role changed for ${vehicleName} to ${roleChangeType} as ${
        isPic ? 'PIC' : 'On-Call'
      }`
    ),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A709',
  },
}

export const UserInRole = Template.bind({})
UserInRole.args = {
  ...args,
  currentUserName: 'Norville Rogers',
}

export const UnassignedRoles = Template.bind({})
UnassignedRoles.args = {
  ...args,
  vehicles: vehicles.map((vehicle) => ({
    ...vehicle,
    picOperators: [],
    onCallOperators: [],
  })),
  currentUserName: 'Shaggy Rogers',
}
