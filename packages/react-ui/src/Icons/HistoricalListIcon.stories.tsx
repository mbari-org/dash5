// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  HistoricalListIcon,
  HistoricalListIconProps,
} from './HistoricalListIcon'

export default {
  title: 'Icons/HistoricalListIcon',
  component: HistoricalListIcon,
} as Meta

const Template: Story<HistoricalListIconProps> = (args) => (
  <HistoricalListIcon {...args} />
)

const args: HistoricalListIconProps = {
  className: 'stroke-stone-300 fill-stone-300',
}

export const Standard = Template.bind({})
Standard.args = args
