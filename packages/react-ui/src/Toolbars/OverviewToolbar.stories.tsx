import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { OverviewToolbar, OverviewToolbarProps } from './OverviewToolbar'
import { faEye } from '@fortawesome/pro-light-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export default {
  title: 'Toolbars/OverviewToolbar',
  component: OverviewToolbar,
} as Meta

const Template: Story<OverviewToolbarProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <OverviewToolbar {...args} />
  </div>
)

const args: OverviewToolbarProps = {
  className: '',
  mission: 'Brizo 7 EcoHab',
  btnLabel: 'Tanner P. (you)/ Brian K.',
  btnIcon: faEye as IconDefinition,
  open: false,
  onToggle: () => {},
  onUserSelect: () => {},
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1294%3A494',
  },
}
