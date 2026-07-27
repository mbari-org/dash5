import { getDraggableMarkerEditProps } from './getDraggableMarkerEditProps'

const handlers = {
  onDragEnd: jest.fn(),
  onEditStateChange: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onColorChange: jest.fn(),
  onSaveToLayer: jest.fn(),
  onRemoveFromLayer: jest.fn(),
}

describe('getDraggableMarkerEditProps', () => {
  it('returns write handlers and draggable when canEditMarkers is true', () => {
    expect(getDraggableMarkerEditProps(true, handlers)).toEqual({
      draggable: true,
      ...handlers,
    })
  })

  it('strips write handlers when canEditMarkers is false', () => {
    expect(getDraggableMarkerEditProps(false, handlers)).toEqual({
      draggable: false,
      onDragEnd: undefined,
      onEditStateChange: undefined,
      onEdit: undefined,
      onDelete: undefined,
      onColorChange: undefined,
      onSaveToLayer: undefined,
      onRemoveFromLayer: undefined,
    })
  })
})
