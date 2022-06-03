import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface NoteProps {
  textNote: VehicleProps['textNote']
  textNoteTime: VehicleProps['textNoteTime']
}

export const Note: React.FC<NoteProps> = ({ textNote, textNoteTime }) => {
  return (
    <g>
      <text
        name="test_note"
        transform="matrix(1 0 0 1 133 174)"
        className="st12 st9 st13"
      >
        {textNote}
      </text>

      <text
        name="test_notetime"
        transform="matrix(1 0 0 1 134 180)"
        className="st12 st9 st24"
      >
        {textNoteTime}
      </text>
    </g>
  )
}
