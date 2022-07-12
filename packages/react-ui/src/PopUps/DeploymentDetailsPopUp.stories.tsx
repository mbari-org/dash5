import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  DeploymentDetailsPopUp,
  DeploymentDetailsPopUpProps,
} from './DeploymentDetailsPopUp'
import { DateTime } from 'luxon'

export default {
  title: 'PopUps/DeploymentDetailsPopUp',
  component: DeploymentDetailsPopUp,
} as Meta

const Template: Story<DeploymentDetailsPopUpProps> = (args) => (
  <DeploymentDetailsPopUp {...args} />
)

const current = DateTime.fromJSDate(new Date())

const args: DeploymentDetailsPopUpProps = {
  name: 'Brizo 7 EcoHab',
  complete: false,
  gitTag: '2021-08-13',
  tagOptions: ['1980-04-25', '1981-07-21', '2016-12-10', '2019-06-24'].map(
    (tag) => ({ id: tag, name: tag })
  ),
  logFiles: ['20211210T045230', '20211210T045231'],
  directoryListFilepath:
    '/opt/tethysdash/data/makai/missionlogs/2022/20220526_20220608.dlist',
  queueSize: 3,
  startDate: current.minus({ days: 5 }).toISO(),
  launchDate: current.toISO(),
  onExpand: () => {
    console.log('expanded')
  },
  onSaveChanges: (savedDeployment) => {
    console.log(savedDeployment)
  },
  onChangeGitTag: (gitTag) => {
    console.log('updated tag', gitTag)
  },
  onSetDeploymentEventToCurrentTime: (event) => {
    console.log(event)
  },
  onClose: () => console.log('closing'),
  open: true,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6086%3A703',
  },
}
