import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ProfileDropdown, ProfileDropdownProps } from './ProfileDropdown'
import avatarUrl from '../assets/avatarUrl'

export default {
  title: 'Dropdowns/ProfileDropdown',
  component: ProfileDropdown,
} as Meta

const Template: Story<ProfileDropdownProps> = (args) => (
  <ProfileDropdown {...args} />
)

const args: ProfileDropdownProps = {
  profileName: 'Tanner Poling',
  emailAddress: 'tanner.poling@gmail.com',
  profileRole: 'operator',
  avatarUrl: avatarUrl,
  options: [
    {
      label: 'Email notifications',
      onSelect: () => {
        console.log('selected')
      },
    },
    {
      label: 'Account settings',
      onSelect: () => {
        console.log('selected')
      },
    },
    {
      label: 'Log out',
      onSelect: () => {
        console.log('selected')
      },
    },
  ],
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2355%3A584',
  },
}
