import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { ReassignmentCell, ReassignmentCellProps } from './ReassignmentCell'

export default {
  title: 'Cells/ReassignmentCell',
  component: ReassignmentCell,
} as Meta

const Template: Story<ReassignmentCellProps> = (args) => (
  <div>
    <ReassignmentCell {...args} />
  </div>
)

const makeOp = (user: string) => ({ user, unixTime: Date.now() - 2 * 3600_000 })

const args: ReassignmentCellProps = {
  operators: [makeOp('John Doe'), makeOp('Jane Smith')],
  currentUserName: 'John Doe',
  onSignIn: () => console.log('Sign in clicked'),
  onSignOut: () => console.log('Sign out clicked'),
}

export const WithCurrentUser = Template.bind({})
WithCurrentUser.args = args
WithCurrentUser.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/gv4hz81GVOY6EFv1ezCjQQ/MBARI-dash-v2?node-id=2719-7122&p=f&t=WPeDnjJ5wqtStq8e-0',
  },
}

export const WithoutCurrentUser = Template.bind({})
WithoutCurrentUser.args = {
  ...args,
  currentUserName: 'Alice Cooper',
}

export const Empty = Template.bind({})
Empty.args = {
  ...args,
  operators: [],
  currentUserName: 'John Doe',
}

export const Loading = Template.bind({})
Loading.args = {
  ...args,
  isLoading: true,
}
