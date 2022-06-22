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

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<CommandDetail {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<CommandDetail>Click Here</CommandDetail>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
