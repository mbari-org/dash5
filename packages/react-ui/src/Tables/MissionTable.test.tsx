import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionTable, MissionTableProps } from './MissionTable'

const props: MissionTableProps = {
  missions: [],
  onSelectMission: () => {
    console.log('something')
  },
  selectedId: 'example',
}

// test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<MissionTable {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<MissionTable>Click Here</MissionTable>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
