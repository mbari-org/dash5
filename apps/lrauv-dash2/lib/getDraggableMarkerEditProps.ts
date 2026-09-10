type LatLng = [number, number]

export type DraggableMarkerEditHandlers = {
  onDragEnd: (pos: LatLng) => void
  onEditStateChange: (isEditing: boolean) => void
  onEdit: (newLabel: string) => void
  onDelete: () => void
  onColorChange: (color: string) => void
  onSaveToLayer: (id: string) => void
  onRemoveFromLayer: (id: string) => void
}

/** Gate DraggableMarker write props behind canEditMarkers (overview + vehicle maps). */
export const getDraggableMarkerEditProps = (
  canEditMarkers: boolean,
  handlers: DraggableMarkerEditHandlers
) => {
  if (!canEditMarkers) {
    return {
      draggable: false as const,
      onDragEnd: undefined,
      onEditStateChange: undefined,
      onEdit: undefined,
      onDelete: undefined,
      onColorChange: undefined,
      onSaveToLayer: undefined,
      onRemoveFromLayer: undefined,
    }
  }

  return {
    draggable: true as const,
    ...handlers,
  }
}
