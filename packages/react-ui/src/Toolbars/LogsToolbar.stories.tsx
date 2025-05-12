import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { LogsToolbar, LogsToolbarProps } from './LogsToolbar'

export default {
  title: 'Toolbars/LogsToolbar',
  component: LogsToolbar,
} as Meta

const Template: Story<
  Omit<LogsToolbarProps, 'deploymentLogsOnly' | 'toggleDeploymentLogsOnly'>
> = (args) => {
  const [deploymentLogsOnly, setDeploymentLogsOnly] = useState(false)
  return (
    <div className="pl-10">
      <LogsToolbar
        {...args}
        deploymentLogsOnly={deploymentLogsOnly}
        toggleDeploymentLogsOnly={() =>
          setDeploymentLogsOnly(!deploymentLogsOnly)
        }
      />
    </div>
  )
}

const args = {
  disabled: false,
  handleRefresh: () => console.log('Refresh logs'),
}

export const Standard = Template.bind({})
Standard.args = args

export const Disabled = Template.bind({})
Disabled.args = {
  ...args,
  disabled: true,
}
