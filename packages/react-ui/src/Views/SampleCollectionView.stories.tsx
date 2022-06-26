import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  SampleCollectionView,
  SampleCollectionViewProps,
} from './SampleCollectionView'

export default {
  title: 'Views/SampleCollectionView',
  component: SampleCollectionView,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=0%3A1',
    },
  },
} as Meta

const Template: Story<SampleCollectionViewProps> = (args) => (
  <SampleCollectionView {...args} />
)

const args: SampleCollectionViewProps = {
  samples: [
    {},
    {
      status: 'partial',
      modifier: 'redo',
      percentCompleted: 73,
      quantity: 2309.13,
      timeCollected: '2022-05-25',
    },
    {
      status: 'partial',
      modifier: 'last',
      percentCompleted: 76,
      quantity: 230.18,
      timeCollected: '2022-05-23',
    },
    {
      status: 'fail',
      modifier: 'redo',
      percentCompleted: 0,
      quantity: 230.08,
      timeCollected: '2022-05-28',
    },
    {
      status: 'good',
      quantity: 229.48,
      timeCollected: '2022-05-16',
    },
  ],
  archived: '2021-08-19T11:48:00.000Z',
  vehicleName: 'makai',
}

export const Standard = Template.bind({})
Standard.args = args
