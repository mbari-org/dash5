import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleInfoCell, VehicleInfoCellProps } from './VehicleInfoCell'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'

const onSurfaceIcon = (
  <svg
    width="31"
    height="27"
    viewBox="0 0 31 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.66004 23.2107L7.69886 23.2018L22.7906 23.0723C24.5911 23.0569 25.9613 22.316 26.7906 21.0991C27.5353 20.0061 27.683 18.7641 27.6758 17.9244C27.6657 16.744 27.1375 15.5327 26.3722 14.6293C25.5836 13.6982 24.3246 12.8471 22.703 12.861L14.6221 12.9303L14.6037 10.7811L14.5865 8.78116L12.5866 8.79831L10.5069 8.81615L8.50699 8.8333L8.52414 10.8332L8.54258 12.9825L7.61128 12.9905L6.57245 12.9994L5.98237 13.8544L3.82609 16.9788L3.02762 18.1358L3.84581 19.2789L6.05538 22.3659L6.66004 23.2107ZM12.6222 12.9475L12.6394 14.9474L14.6393 14.9303L22.7201 14.8609C24.4593 14.846 25.6651 16.6783 25.6759 17.9416C25.6867 19.2048 25.1975 21.0516 22.7734 21.0724L7.68171 21.2019L5.47214 18.1148L7.62843 14.9904L8.55973 14.9824L10.5597 14.9653L10.5425 12.9653L10.5412 12.816L10.5241 10.8161L10.6039 10.8154L12.524 10.7989L12.6038 10.7982L12.6209 12.7982L12.6222 12.9475Z"
      fill="#6B7280"
    />
    <path
      d="M1 23.0722C1.59361 22.75 2.14273 22.3855 2.62989 22.023C3.95704 21.0356 5.87869 20.9484 7.07793 22.0878V22.0878C8.20223 23.1559 9.96631 23.1559 11.0906 22.0878L11.1862 21.997C12.364 20.8779 14.2121 20.8779 15.39 21.997V21.997C16.5679 23.116 18.416 23.116 19.5938 21.997V21.997C20.7717 20.8779 22.6198 20.8779 23.7976 21.997V21.997C24.9755 23.116 26.8205 23.1115 28.0569 22.0575C28.5151 21.6668 28.9988 21.2696 29.4566 20.9217"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1 22.0722C1.59361 21.75 2.14273 21.3855 2.62989 21.023C3.95704 20.0356 5.87869 19.9484 7.07793 21.0878V21.0878C8.20223 22.1559 9.96631 22.1559 11.0906 21.0878L11.1862 20.997C12.364 19.8779 14.2121 19.8779 15.39 20.997V20.997C16.5679 22.116 18.416 22.116 19.5938 20.997V20.997C20.7717 19.8779 22.6198 19.8779 23.7976 20.997V20.997C24.9755 22.116 26.8205 22.1115 28.0569 21.0575C28.5151 20.6668 28.9988 20.2696 29.4566 19.9217"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1 25.0677C1.59361 24.7455 2.14273 24.3809 2.62989 24.0185C3.95704 23.0311 5.87869 22.9439 7.07793 24.0832V24.0832C8.20223 25.1514 9.96631 25.1514 11.0906 24.0832L11.1862 23.9924C12.364 22.8734 14.2121 22.8734 15.39 23.9924V23.9924C16.5679 25.1115 18.416 25.1115 19.5938 23.9924V23.9924C20.7717 22.8734 22.6198 22.8734 23.7976 23.9924V23.9924C24.9755 25.1115 26.8205 25.107 28.0569 24.053C28.5151 23.6623 28.9988 23.2651 29.4566 22.9172"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M14.9998 6.55098L15.9487 7.07695C16.5214 7.39436 16.9736 7.88508 17.237 8.47516L17.6737 9.45298"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.1948 1.87199L19.0748 3.63409C19.8776 4.12527 20.5239 4.82672 20.9402 5.65868L22.4339 8.64332"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export default {
  title: 'Cells/VehicleInfoCell',
  component: VehicleInfoCell,
} as Meta

const Template: Story<VehicleInfoCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <VehicleInfoCell {...args} />
  </div>
)

const args: VehicleInfoCellProps = {
  icon: <UnderwaterIcon />,
  headline: 'Likely underwater',
  subtitle: 'Last confirmed on surface 47min ago',
  lastCommsOverSat: 'Today at 14:08:36 (47m ago)',
  estimate: 'Est. to surface in 15 mins at ~14:55',
  onSelect: () => {},
}

export const Underwater = Template.bind({})
Underwater.args = args
Underwater.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A579',
  },
}

export const OnSurface = Template.bind({})
OnSurface.args = {
  ...args,
  icon: onSurfaceIcon,
  headline: 'Possibly on the surface',
  subtitle: 'Last confirmed on the surface 15min ago',
  lastCommsOverSat: 'Today at 14:40:36 (15m ago)',
  estimate: 'Est. to submerge in 2 minutes at ~14:41',
}
OnSurface.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A534',
  },
}
