import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DocCell, DocCellProps } from './DocCell'

const props: DocCellProps = {
  onSelect: () => {
    console.log('event fired')
  },
  onSelectMore: () => {
    console.log('event fired')
  },
  onSelectMission: (id) => {
    console.log(id)
  },
  time: '16:29:32',
  date: 'Dec. 15, 2021',
  label: 'Maintenance Log - Brizo',
  missions: [{ name: 'Gup S EcoHAB', id: '1' }],
}

test('should render the label', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
})

test('should render the date and time', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByLabelText(/time/i)).toHaveTextContent(props.time)
  expect(screen.getByLabelText(/date/i)).toHaveTextContent(props.date)
})

test('should render the mission tag', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByText(`${props?.missions?.[0].name}`)).toBeInTheDocument()
})

test('should render the more options button', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByLabelText(/more options/i)).toBeInTheDocument()
})
