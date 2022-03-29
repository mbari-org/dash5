import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { addDecorator } from '@storybook/react'
import { withTests } from '@storybook/addon-jest'

import '../dist/mbari-ui.css'
import results from '../.jest-test-results.json'

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
  <DndProvider backend={HTML5Backend}>
    <Layout>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
        rel="stylesheet"
      />{' '}
      <Story />
    </Layout>
  </DndProvider>
))
