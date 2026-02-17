import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  RoleReassignButton,
  RoleReassignButtonProps,
} from './RoleReassignButton'

export default {
  title: 'Navigation/RoleReassignButton',
  component: RoleReassignButton,
} as Meta

const Template: Story<RoleReassignButtonProps> = (args) => (
  <div className="bg-contentAreaBackgroundAlt flex p-4">
    <RoleReassignButton {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  pics: ['Norville Rogers'],
  onCalls: ['Fred Jones'],
  currentUserName: undefined,
  onRoleReassign: () => console.log('Role reassign clicked'),
}
Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components',
  },
}

export const CurrentUserIsPic = Template.bind({})
CurrentUserIsPic.args = {
  pics: ['Norville Rogers'],
  onCalls: ['Velma Dinkley'],
  currentUserName: 'Norville Rogers',
  onRoleReassign: () => console.log('Role reassign clicked'),
}

export const CurrentUserIsOnCall = Template.bind({})
CurrentUserIsOnCall.args = {
  pics: ['Norville Rogers'],
  onCalls: ['Fred Jones'],
  currentUserName: 'Fred Jones',
  onRoleReassign: () => console.log('Role reassign clicked'),
}

export const CurrentUserIsBoth = Template.bind({})
CurrentUserIsBoth.args = {
  pics: ['Norville Rogers'],
  onCalls: ['Norville Rogers'],
  currentUserName: 'Norville Rogers',
  onRoleReassign: () => console.log('Role reassign clicked'),
}

export const MultipleOperators = Template.bind({})
MultipleOperators.args = {
  pics: ['Norville Rogers', 'Daphne Blake', 'Velma Dinkley'],
  onCalls: ['Fred Jones', 'Scoobert Doo'],
  currentUserName: 'Daphne Blake',
  onRoleReassign: () => console.log('Role reassign clicked'),
}

export const Empty = Template.bind({})
Empty.args = {
  pics: [],
  onCalls: [],
  currentUserName: undefined,
  onRoleReassign: () => console.log('Role reassign clicked'),
}
