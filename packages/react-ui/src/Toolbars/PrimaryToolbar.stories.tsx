import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { PrimaryToolbar, PrimaryToolbarProps } from './PrimaryToolbar'

export default {
  title: 'Toolbars/PrimaryToolbar',
  component: PrimaryToolbar,
} as Meta

const Template: Story<PrimaryToolbarProps> = (args) => {
  const options = ['Overview', 'Brizo', 'Aku', 'Pontus']
  const [currentOption, setCurrentOption] = useState(options[0])
  return (
    <PrimaryToolbar
      {...args}
      options={options}
      currentOption={currentOption}
      onSelectOption={(option: string) => setCurrentOption(option)}
    />
  )
}

const args: PrimaryToolbarProps = {
  className: '',
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
