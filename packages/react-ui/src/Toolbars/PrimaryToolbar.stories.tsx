import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { PrimaryToolbar, PrimaryToolbarProps } from './PrimaryToolbar'
import { ProfileDropdown } from '../Dropdowns'

export default {
  title: 'Toolbars/PrimaryToolbar',
  component: PrimaryToolbar,
} as Meta

const Template: Story<PrimaryToolbarProps> = (args) => {
  const [currentOption, setCurrentOption] = useState(args.options?.[0])
  return (
    <PrimaryToolbar
      {...args}
      currentOption={currentOption}
      onSelectOption={(option: string) => setCurrentOption(option)}
    />
  )
}

const args: PrimaryToolbarProps = {
  className: '',
  options: ['Overview', 'brizo', 'aku', 'pontus'],
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const SignedIn = Template.bind({})
SignedIn.args = { ...args, signedIn: true, avatarName: 'Jane Appleseed' }
SignedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const SignedInWithDropdown = Template.bind({})
SignedInWithDropdown.args = {
  ...args,
  signedIn: true,
  avatarName: 'Jane Appleseed',
  secondaryDropdown: (
    <>
      <ProfileDropdown
        className="top-100 absolute right-0 z-20 mt-2"
        profileName="Jane Appleseed"
        profileRole="Administrator"
        emailAddress="admin@mbari.org"
        options={[
          {
            label: 'Logout',
            onSelect: () => undefined,
          },
        ]}
      />
      <button className="fixed top-0 left-0 z-10 h-screen w-screen bg-stone-100 opacity-50 active:bg-stone-200"></button>
    </>
  ),
}
SignedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const SignedInWithProfileImage = Template.bind({})
SignedInWithProfileImage.args = {
  ...args,
  signedIn: true,
  avatarName: 'Jane Appleseed',
  avatarUrl: 'https://i.pravatar.cc/150?img=15',
}
SignedInWithProfileImage.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const SignedInWithNoAccountDetails = Template.bind({})
SignedInWithNoAccountDetails.args = {
  ...args,
  signedIn: true,
}
SignedInWithNoAccountDetails.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const WithAddClick = Template.bind({})
WithAddClick.args = {
  ...args,
  signedIn: true,
  onAddClick: () => console.log('add'),
}
WithAddClick.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const Overflow = Template.bind({})
Overflow.args = {
  ...args,
  options: [
    'Overview',
    'brizo',
    'aku',
    'pontus',
    'galene',
    'pallas',
    'aku',
    'triton',
    'ahi',
    'daphne',
    'opah',
    'simulator',
    'mesobot',
    'proxima',
    'stella',
    'polaris',
    'pyxis',
    'makai',
    'melia',
    'galene',
    'tethys',
    'pontus',
  ],
  onAddClick: () => console.log('add'),
}
Overflow.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}

export const WithRemoveClick = Template.bind({})
WithRemoveClick.args = {
  ...args,
  signedIn: true,
  onRemoveOption: (option: string) => console.log(`remove: ${option}`),
  canRemoveOption: (option: string) => option !== 'Overview',
}
WithRemoveClick.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A335',
  },
}
