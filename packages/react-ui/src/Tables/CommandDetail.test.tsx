import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandDetail, CommandDetailProps } from './CommandDetail'

const props: CommandDetailProps = {
  commands: [
    {
      name: 'Module',
      description: 'Description of a module',
      value: 'Science',
      options: ['Science', 'Alchemy'],
    },
    {
      name: 'Persist',
      description: 'Description of a unit',
    },
  ],
  onSelect: (param, value) => console.log(`param: ${param}  value: ${value}`),
}

test('should render the component', async () => {
  expect(() => render(<CommandDetail {...props} />)).not.toThrow()
})

test('should display the command name', async () => {
  render(<CommandDetail {...props} />)

  expect(screen.getByText(props.commands[0].name)).toBeInTheDocument()
})

test('should display the command description', async () => {
  render(<CommandDetail {...props} />)

  expect(screen.getByText(props.commands[0].description)).toBeInTheDocument()
})

test('should display the pre-populated value in the dropdown if provided', async () => {
  render(<CommandDetail {...props} />)

  expect(
    screen.queryByDisplayValue(`${props.commands[0].value}`)
  ).toBeInTheDocument()
})

test('should display a checkbox if no parameter options are provided', async () => {
  render(<CommandDetail {...props} />)

  expect(screen.queryByRole('checkbox')).toBeInTheDocument()
})
