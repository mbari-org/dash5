import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import {
  NewDeploymentForm,
  NewDeploymentFormProps,
  NewDeploymentFormValues,
} from './NewDeploymentForm'
import { wait } from '@mbari/utils'
import { DateTime } from 'luxon'

export default {
  title: 'Forms/NewDeploymentForm',
} as Meta

const Template: Story<NewDeploymentFormProps> = (args) => {
  const [loading, setLoading] = useState(args.loading ?? false)

  const onSubmit: any = async (values: NewDeploymentFormValues) => {
    setLoading(true)
    await wait(1)
    setLoading(false)
    console.log('Submitted', values)
    return undefined
  }

  const [defaultValues, setDefaultValues] = useState<NewDeploymentFormValues>(
    args.defaultValues ?? {}
  )

  const onRandomize = () => {
    setDefaultValues({
      startTime: DateTime.now().toISO(),
      timeZone: '',
      deploymentName: `${DateTime.now().toISO()} Deployment`,
      gitTag: ['2022-04-22A', '2022-04-22', '2022-04-20'][
        Math.floor(Math.random() * 3)
      ],
    })
  }

  const onReset = () => {
    setDefaultValues({
      startTime: '',
      timeZone: '',
      deploymentName: '',
      gitTag: '',
    })
  }

  return (
    <>
      <div className="rounded border p-4">
        <NewDeploymentForm
          {...args}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          loading={loading}
        />
      </div>
      <div className="flex">
        <button className="mt-3 mr-2 bg-stone-200 p-2" onClick={onRandomize}>
          Randomize Form
        </button>
        <button className="mt-3 bg-stone-200 p-2" onClick={onReset}>
          Reset Form
        </button>
      </div>
    </>
  )
}

const args: NewDeploymentFormProps = {
  onSubmit: async (values) => {
    await wait(1)
    console.log('Submitted', values)
    return undefined
  },
  defaultValues: {
    startTime: DateTime.local().toISO(),
    timeZone: '',
    gitTag: '2022-04-22A',
  },
  tags: [
    '2022-04-25',
    '2022-04-22A',
    '2022-04-22',
    '2022-04-20',
    '2022-04-13',
  ].map((tag) => ({ id: tag, name: tag })),
}

export const Primary = Template.bind({})
Primary.args = args
