import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionTable, MissionTableProps } from './MissionTable'

const props: MissionTableProps = {
  missions: [
    {
      id: '1',
      category: 'Science',
      name: 'sci2',
      task: 'Test mission',
      vehicle: 'Brizo',
      ranBy: 'Jordan Caress',
      ranOn: 'Dec. 10, 2021',
    },
  ],
  onSelectMission: () => {
    console.log('test')
  },
  selectedId: '1',
}

test('should render the component', async () => {
  expect(() => render(<MissionTable {...props} />)).not.toThrow()
})

test('should display header labels', async () => {
  render(<MissionTable {...props} />)
  expect(screen.getByText(/Mission Name/i)).toBeInTheDocument()
})

test('should display category and name labels', async () => {
  render(<MissionTable {...props} />)
  const { category, name } = props.missions[0]

  expect(screen.getByText(`${category}: ${name}`)).toBeInTheDocument()
})

test('should display mission task label', async () => {
  render(<MissionTable {...props} />)
  expect(screen.getByText(/test mission/i)).toBeInTheDocument()
})

test('should display the vehicle label if a recent run is present', async () => {
  render(
    <MissionTable
      {...props}
      missions={[{ ...props.missions[0], recentRun: true }]}
    />
  )
  expect(screen.getByText(/Brizo/i)).toBeInTheDocument()
})

test('should not display the vehicle label', async () => {
  render(<MissionTable {...props} />)
  expect(screen.queryByText(/Brizo/i)).not.toBeInTheDocument()
})

test('should display No description label when description is not provided', async () => {
  render(<MissionTable {...props} />)
  expect(screen.getByText(/no description/i)).toBeInTheDocument()
})

test('should display description label when description is provided', async () => {
  render(
    <MissionTable
      {...props}
      missions={[{ ...props.missions[0], description: 'test description' }]}
    />
  )
  expect(screen.getByText(/test description/i)).toBeInTheDocument()
})

test('should display run details including pilot and run date', async () => {
  render(<MissionTable {...props} />)
  expect(screen.getByText(/Jordan Caress./i)).toBeInTheDocument()
  expect(screen.getByText(/on Dec. 10, 2021./i)).toBeInTheDocument()
})

test('should display run details including number of waypoints when provided', async () => {
  render(
    <MissionTable
      {...props}
      missions={[{ ...props.missions[0], waypointCount: 2 }]}
    />
  )
  expect(screen.getByText(/This mission has 2 waypoints/i)).toBeInTheDocument()
})

test('should display run details including number run location when provided', async () => {
  render(
    <MissionTable
      {...props}
      missions={[{ ...props.missions[0], ranAt: 'test location' }]}
    />
  )
  expect(screen.getByText(/Last ran by Jordan Caress/i)).toBeInTheDocument()
})
