import '@testing-library/jest-dom'
import React, { useEffect, useRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  SharedPathContextProvider,
  useSharedPath,
} from './SharedPathContextProvider'

const TestPath: React.FC<{
  name: string
  points: [number, number][]
  grouped?: boolean
  visible?: boolean
}> = ({ name, points, grouped, visible }) => {
  const { sharedPath, dispatch } = useSharedPath()
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) {
      return
    }
    if (grouped) {
      dispatch({ type: 'append', coords: { [name]: points } })
    } else {
      dispatch({ type: 'clear' })
    }
    mounted.current = true
  })
  const unmounted = useRef(false)
  useEffect(() => {
    if (!visible && !unmounted.current) {
      unmounted.current = true
      dispatch({ type: 'remove', coords: { [name]: points } })
    }
  }, [visible, dispatch, name, points])
  const sharedCoords = Object.values(sharedPath).flat()
  return visible ? (
    <p data-testid={`result.${name}`}>
      {sharedCoords.length > 1 ? sharedCoords.join(', ') : 'no shared path'}
    </p>
  ) : null
}

describe('SharedPathContext', () => {
  test('should render the combined paths when grouped', async () => {
    render(
      <SharedPathContextProvider>
        <TestPath
          name="A"
          points={[
            [1, 1],
            [2, 2],
          ]}
          grouped
          visible
        />
        <TestPath
          name="B"
          points={[
            [3, 3],
            [4, 4],
          ]}
          grouped
          visible
        />
      </SharedPathContextProvider>
    )
    expect(screen.getByTestId(/result\.A/i)).toHaveTextContent(
      '1,1, 2,2, 3,3, 4,4'
    )
  })

  test('should clear the combined paths when not grouped', async () => {
    render(
      <SharedPathContextProvider>
        <TestPath
          name="C"
          points={[
            [1, 1],
            [2, 2],
          ]}
          grouped
          visible
        />
        <TestPath
          name="D"
          points={[
            [3, 3],
            [4, 4],
          ]}
          grouped
          visible
        />
        <TestPath
          name="E"
          points={[
            [5, 5],
            [6, 6],
          ]}
          visible
        />
      </SharedPathContextProvider>
    )
    expect(screen.getByTestId(/result\.E/i)).toHaveTextContent('no shared path')
  })

  test('should remove a specific path from the combined paths when not removed', async () => {
    const StatefulExample: React.FC = () => {
      const [hidePath, setHidePath] = useState(false)
      return (
        <SharedPathContextProvider>
          <TestPath
            name="F"
            points={[
              [1, 1],
              [2, 2],
            ]}
            grouped
            visible
          />
          <TestPath
            name="G"
            points={[
              [3, 3],
              [4, 4],
            ]}
            grouped
            visible={!hidePath}
          />
          <TestPath
            name="H"
            points={[
              [5, 5],
              [6, 6],
            ]}
            grouped
            visible
          />
          <button onClick={() => setHidePath(true)} data-testid="hidePath">
            Hide
          </button>
        </SharedPathContextProvider>
      )
    }

    render(<StatefulExample />)
    fireEvent.click(screen.getByTestId('hidePath'))
    expect(screen.getByTestId(/result\.H/i)).toHaveTextContent(
      '1,1, 2,2, 5,5, 6,6'
    )
  })
})
