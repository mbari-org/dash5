import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { Tab, TabProps } from './Tab'
import { faCamera } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export default {
  title: 'Navigation/Tab',
  component: Tab,
} as Meta

const Template: Story<TabProps> = (args) => <Tab {...args} />

const defaultArgs = {
  selected: false,
  label: 'Depth Data',
  onClick: action('clicked'),
}

export const Standard = Template.bind({})
Standard.args = defaultArgs
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1601%3A524',
  },
}

export const Selected = Template.bind({})
Selected.args = { ...defaultArgs, selected: true }

export const WithIcon = Template.bind({})
WithIcon.args = {
  ...defaultArgs,
  selected: true,
  label: <FontAwesomeIcon icon={faChevronDown as IconProp} />,
}
WithIcon.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1601%3A524',
  },
}
