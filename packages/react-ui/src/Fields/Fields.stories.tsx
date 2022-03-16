import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Fields, FieldsProps } from './Fields'
import { TextField } from './TextField'
import { DateField } from './DateField'
import { faBarcode } from '@fortawesome/pro-solid-svg-icons/faBarcode'
import { faCity } from '@fortawesome/pro-solid-svg-icons/faCity'
import { faEnvelope } from '@fortawesome/pro-solid-svg-icons/faEnvelope'
import { faPhone } from '@fortawesome/pro-solid-svg-icons/faPhone'
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons/faUserCircle'
import { faLockAlt } from '@fortawesome/pro-solid-svg-icons/faLockAlt'

export default {
  title: 'Fields/Fields',
  component: Fields,
} as Meta

const Template: Story<FieldsProps> = (args) => (
  <div className="flex bg-stone-100 p-4">
    <Fields {...args}>
      <Fields nested grow>
        <TextField
          name="firstName"
          label="First Name"
          placeholder="John"
          className="w-1/2"
          icon={faUserCircle}
          grow
        />
        <TextField
          name="lastName"
          label="Last Name"
          placeholder="Appleseed"
          className="w-1/2"
          icon={faUserCircle}
          grow
        />
      </Fields>
      <TextField
        name="email"
        label="Email Address"
        placeholder="you@example.com"
        icon={faEnvelope}
        grow
        required
      />
      <TextField
        name="phone"
        label="Phone Number"
        className="w-full md:w-1/3"
        placeholder="(480) 555-1234"
        icon={faPhone}
        required
      />
      <DateField name="birthday" label="Birth Date" />
      <Fields nested className="md:my-4" grow>
        <TextField
          name="password"
          label="Password"
          className="w-full"
          type="password"
          icon={faLockAlt}
          required
        />
        <TextField
          name="confirm"
          label="Confirm Password"
          className="w-full"
          type="password"
          required
        />
      </Fields>
      <Fields nested className="md:my-4">
        <TextField
          name="city"
          label="City"
          className="w-full sm:w-64"
          icon={faCity}
          required
        />
        <TextField
          name="state"
          label="State"
          className="w-full sm:w-24"
          required
        />
        <TextField
          name="zip"
          label="Zip"
          className="w-full sm:w-36"
          icon={faBarcode}
          required
        />
      </Fields>
    </Fields>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  register: () => null,
}

export const Mobile = Template.bind({})
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
}
Mobile.args = {}

export const Grow = Template.bind({})
Grow.args = { grow: true }
