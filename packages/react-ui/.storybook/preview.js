import React from 'react'
import { UIProvider } from '../src/UIProvider'
import { addDecorator } from '@storybook/react'
import { withTests } from '@storybook/addon-jest'

import 'leaflet/dist/leaflet.css'
import '../dist/mbari-ui.css'
import results from '../.jest-test-results.json'
import '../../../apps/lrauv-dash2/styles/vehicle.css'

export const decorators = [
  withTests({
    results,
  }),
]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const Layout = ({ children }) => {
  return (
    <div className="lg:px-20 lg:py-10">
      {children}
      <div id="overlay-root" />
    </div>
  )
}

addDecorator((Story) => (
  <UIProvider>
    <Layout>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
        rel="stylesheet"
      />{' '}
      <link
        href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;700&display=swap"
        rel="stylesheet"
      />{' '}
      <Story />
    </Layout>
  </UIProvider>
))
