import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Vehicle, VehicleProps } from './Vehicle'

export default {
  title: 'Diagrams/Vehicle',
  component: Vehicle,
} as Meta

const Template: Story<VehicleProps> = (args) => <Vehicle {...args} />

const args: VehicleProps = {
  name: 'BRIZO',
  mission: 'sci2 - 13:14 • 26May22',
  status: 'onMission',
  satTime: '11:24',
  cellTime: '11:21',
  logStartTime: '12:29',
  updated: '11:50',
  nextComm: '12:24 - in 34m',
  timeout: '07:21 - in 19h 31m',
}

export const Deployed = Template.bind({})
Deployed.args = {
  ...args,
  headingDegrees: '106',
  dvl: true,
  dropTime: 'long time ago',
  hardwareLight: true,
  groundFault: 'OK',
  groundFaultTime: '1h 47m ago',
  batteryAmps: 0.0,
  batteryVolts: 14.6,
  batteryAmpTime: '28m ago',
  gpsTime: '11:21',
}

Deployed.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_brizo.svg?dummy=1653078296172',
  },
}

export const Scheduled = Template.bind({})
Scheduled.args = {
  ...args,
  name: 'GALENE',
  headingDegrees: '62',
  mission: 'sci2_backseat - 14:03 • 26May22',
  scheduled: 'sci2_backseat',
  dropWeight: true,
  batteryVolts: 16.3,
}
Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_galene.svg?dummy=1653078296172',
  },
}
export const Recovered = Template.bind({})
Recovered.args = {
  ...args,
  name: 'MAKAI',
  status: 'recovered',
  mission: 'RECOVERED 10:11 • 26May22',
  dropWeight: true,
  gpsTime: '14:44',
}
Recovered.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_makai.svg?dummy=1653078296172',
  },
}
export const PluggedIn = Template.bind({})
PluggedIn.args = {
  ...args,
  name: 'DAPHNE',
  status: 'pluggedIn',
  mission: 'PLUGGED IN 08:49 • 19May22',
}
PluggedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://okeanids.mbari.org/widget/auv_daphne.svg?dummy=1653078296172',
  },
}
