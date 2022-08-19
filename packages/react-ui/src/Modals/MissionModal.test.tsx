import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionModal, MissionModalProps } from './MissionModal'

const props: MissionModalProps = {
  currentIndex: 0,
  vehicleName: 'Brizo',
  recentRuns: [
    {
      id: '1',
      name: 'Behavior',
    },
    {
      id: '2',
      name: 'Demo',
    },
    {
      id: '3',
      name: 'Engineering',
    },
  ],

  missions: [
    {
      id: '1',
      category: 'Science',
      name: 'sci2',
      task: 'Test mission',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Brizo',
      ranBy: 'Jordan Caress',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 2,
    },
    {
      id: '2',
      category: 'Maintenance',
      name: 'sci2',
      task: 'Mission 2',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Tethys',
      ranBy: 'Joost Daniels',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 4,
    },
    {
      id: '3',
      category: 'Science',
      name: 'profile_station',
      task: 'Profile station at C1 for the night',
      description:
        'This mission yoyos in a circle around a specified location.',
      vehicle: 'Tethys',
      ranBy: 'Ben Ranaan',
      ranOn: 'Dec. 10, 2021',
      ranAt: 'C1',
    },
  ],

  onCancel: () => console.log('cancel'),
  onSchedule: () => console.log('scheduled'),
}

test('should render the component', async () => {
  expect(() => render(<MissionModal {...props} />)).not.toThrow()
})

// Step 1 tests
test('should display mission tasks', async () => {
  render(<MissionModal {...props} />)
  expect(screen.queryByText(props.missions[0].task)).toBeInTheDocument()
})

test('should display mission category and name labels', async () => {
  render(<MissionModal {...props} />)
  const { category, name } = props.missions[0]

  expect(screen.getByText(`${category}: ${name}`)).toBeInTheDocument()
})

test('should display mission descriptions', async () => {
  render(<MissionModal {...props} />)
  expect(
    screen.queryByText(`${props.missions[2].description}`)
  ).toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(<MissionModal {...props} />)
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})
