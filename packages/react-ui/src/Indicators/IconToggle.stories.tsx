import { useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { IconToggle } from './IconToggle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { SubIcon } from '../Icons/SubIcon'
import { HistoricalListIcon } from '../Icons/HistoricalListIcon'
import clsx from 'clsx'

export default {
  title: 'Indicators/IconToggle',
  component: IconToggle,
} as Meta

const Template: Story = () => {
  const [isToggled, setIsToggled] = useState(false)

  return (
    <div className="p-10">
      <IconToggle
        iconLeft={<FontAwesomeIcon icon={faSun} size="xl" />}
        iconRight={<FontAwesomeIcon icon={faMoon} size="xl" />}
        isToggled={isToggled}
        onToggle={setIsToggled}
      />
    </div>
  )
}

export const Standard = Template.bind({})

const TemplateLogs: Story = () => {
  const [isToggled, setIsToggled] = useState(false)

  return (
    <div className="p-10">
      <IconToggle
        iconLeft={
          <HistoricalListIcon
            className={clsx(
              'transition-colors duration-300',
              isToggled ? 'text-gray-400' : 'text-black'
            )}
          />
        }
        iconRight={
          <SubIcon
            className={clsx(
              'transition-colors duration-300',
              isToggled ? 'text-black' : 'text-gray-400'
            )}
          />
        }
        isToggled={isToggled}
        onToggle={setIsToggled}
        ariaLabelLeft="Displaying all logs"
        ariaLabelRight="Displaying deployment logs"
      />
    </div>
  )
}

export const Logs = TemplateLogs.bind({})
