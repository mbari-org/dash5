import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ResourcesDropdown, ResourcesDropdownProps } from './ResourcesDropdown'

export default {
  title: 'Dropdowns/ResourcesDropdown',
  component: ResourcesDropdown,
} as Meta

const Template: Story<ResourcesDropdownProps> = (args) => (
  <div className="flex justify-end p-4">
    <ResourcesDropdown {...args} />
  </div>
)

const args: ResourcesDropdownProps = {
  resourceLinks: [
    {
      label: 'LRAUV Watchbill Signup',
      url: 'https://docs.mbari.org/watchbill',
    },
  ],
  trainingLinks: [
    {
      label: 'PIC Training (Formative)',
      url: 'https://formative.mbari.org',
    },
    {
      label: 'LRAUV Procedures Manual',
      url: 'https://docs.mbari.org/procedures',
    },
  ],
  adminLinks: [
    {
      label: 'Frontend Configuration',
      url: 'https://dash5.mbari.org/admin/settings',
    },
    {
      label: 'Feature Flags',
      url: 'https://dash5.mbari.org/admin/flags',
    },
  ],
  isAdmin: false,
}

export const Standard = Template.bind({})
Standard.args = args

export const AdminView = Template.bind({})
AdminView.args = {
  ...args,
  isAdmin: true,
}

export const EmptyState = Template.bind({})
EmptyState.args = {}
