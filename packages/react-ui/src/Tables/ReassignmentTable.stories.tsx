import { Story, Meta } from '@storybook/react/types-6-0'
import { ReassignmentTable, ReassignmentTableProps } from './ReassignmentTable'

export default {
  title: 'Tables/ReassignmentTable',
  component: ReassignmentTable,
} as Meta

const Template: Story<ReassignmentTableProps> = (args) => (
  <div className="w-full max-w-lg">
    <ReassignmentTable {...args} />
  </div>
)

const mockVehicles = [
  {
    name: 'Ahi',
    picOperators: ['John Doe', 'Marc Allentoft-Larsen'],
    onCallOperators: ['Alice Cooper'],
  },
  {
    name: 'Galene',
    picOperators: ['Mike mccan@mbari.org'],
    onCallOperators: ['Andrea Vander Woude'],
  },
  {
    name: 'Triton',
    picOperators: [],
    onCallOperators: [],
  },
]

const defaultArgs: ReassignmentTableProps = {
  vehicles: mockVehicles,
  currentUserName: 'John Doe',
  onRoleChange: (vehicleName, roleChangeType, isPic) =>
    console.log(
      `Role changed for ${vehicleName} to ${roleChangeType} as ${
        isPic ? 'PIC' : 'On-Call'
      }`
    ),
}

export const Default = Template.bind({})
Default.args = defaultArgs

export const Loading = Template.bind({})
Loading.args = {
  ...defaultArgs,
  isLoading: true,
}

export const NotInRole = Template.bind({})
NotInRole.args = {
  ...defaultArgs,
  currentUserName: 'Not Present',
}

export const SingleVehicle = Template.bind({})
SingleVehicle.args = {
  ...defaultArgs,
  vehicles: [mockVehicles[0]],
}
