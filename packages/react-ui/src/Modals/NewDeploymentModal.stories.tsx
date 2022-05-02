import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'

import {
  NewDeploymentModal,
  NewDeploymentModalProps,
} from './NewDeploymentModal'
import { wait } from '@mbari/utils'
import { NewDeploymentFormValues } from '../Forms/NewDeploymentForm'

export default {
  title: 'Modals/NewDeploymentModal',
  component: NewDeploymentModal,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gv4hz81GVOY6EFv1ezCjQQ/MBARI-dash-v2?node-id=344%3A7377',
    },
  },
} as Meta

const Template: Story<NewDeploymentModalProps> = (args) => (
  <NewDeploymentModal {...args} />
)

export const Standard = Template.bind({})
Standard.args = {
  vehicleName: 'Brizo',
  open: true,
  onSubmit: async (values: NewDeploymentFormValues) => {
    await wait(1)
    return undefined
  },
  onClose: action('close'),
  onCancel: action('cancel'),
  tags: [
    '2022-04-25',
    '2022-04-22A',
    '2022-04-22',
    '2022-04-20',
    '2022-04-13',
  ].map((tag) => ({ id: tag, name: tag })),
}
