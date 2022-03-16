import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faTimes } from '@fortawesome/pro-regular-svg-icons'

import { Icon } from '../Navigation'
import { useEventListener } from 'utils'
import clsx from 'clsx'

export interface ModalProps {
  title: string
  open: boolean
  zIndex?: string
  onClose?: () => void
  draggable?: boolean
  onFocus?: () => void
}

interface Coordinate {
  x: number
  y: number
}

interface ModalDragState {
  origin: Coordinate
  translate: Coordinate
  mouse: Coordinate
  onMouseUp?: EventListener
  onMouseMove?: EventListener
  dragging: boolean
}

const DEFAULT_STATE: ModalDragState = {
  origin: { x: 0, y: 0 },
  mouse: { x: 0, y: 0 },
  translate: { x: 0, y: 0 },
  dragging: false,
}

const OVERLAY =
  'fixed inset-0 flex flex-col items-center justify-center w-screen h-screen pointer-events-none'
const MODAL =
  'flex flex-col bg-white w-full py-1 px-1 md:max-h-3/4 md:max-w-md rounded-md border m-auto pointer-events-auto transition-shadow transition-colors duration-300 ease-out relative'
const HEADER = 'flex justify-between bg-stone-100 bg-opacity-10 rounded mt-0'
const TITLE = 'capitalize text-stone-900 font-medium text-xl my-auto py-1 pl-3'
const DRAG_BUTTON =
  'cursor-move flex flex-grow bg-stone-100 bg-opacity-50 hover:bg-stone-100 ml-1 my-1 rounded transition-colors duration-100 ease-out'
const CLOSE_BUTTON =
  'hover:bg-stone-100 rounded-full w-10 h-10 transition-colors my-1 mr-1 duration-150 text-2xl focus:outline-none'
const MODAL_BODY = 'px-3 py-4 text-base font-normal overflow-scroll'
const NOT_DRAGGING = 'shadow-xl border-stone-100'
const DRAGGING = 'shadow-2xl border-stone-200'

export const Modal: React.FC<ModalProps> = ({
  title,
  open,
  onClose: handleOnClose,
  children,
  draggable,
  onFocus: handleFocus,
  zIndex = 'z-40',
}) => {
  const [state, setState] = useState<ModalDragState>(DEFAULT_STATE)
  const dialog = useRef<HTMLElement>(null)
  const handleCloseClick: React.MouseEventHandler = (e) => {
    e.stopPropagation()
    handleOnClose?.()
  }

  useEffect(() => {
    if (!open) {
      setState(DEFAULT_STATE)
    }
  }, [open])

  const { dragging, translate, mouse } = state
  useEffect(() => {
    if (dragging && dialog.current) {
      const minX = -dialog.current.offsetLeft - dialog.current.offsetWidth / 2
      const minY = -dialog.current.offsetTop
      const maxY =
        window.innerHeight -
        dialog.current.offsetHeight / 2 +
        dialog.current.offsetTop
      const maxX =
        window.innerWidth -
        dialog.current.offsetWidth / 2 -
        dialog.current.offsetLeft
      const x = Math.min(maxX, Math.max(minX, mouse.x - state.origin.x))
      const y = Math.min(maxY, Math.max(minY, mouse.y - state.origin.y))
      dialog.current.style.transform = `translate(${x}px, ${y}px)`
      if (translate.x !== x || translate.y !== y) {
        setState({ ...state, translate: { x, y } })
      }
    }
  }, [mouse, dialog.current, translate, dragging, state, setState])

  // Update mouse pos on move...
  const onMouseMove: EventListener = useCallback(
    (e) => {
      if (dragging) {
        e.preventDefault()
        setState({
          ...state,
          mouse: { x: (e as MouseEvent).pageX, y: (e as MouseEvent).pageY },
        })
      }
    },
    [dragging, state, setState]
  )
  useEventListener({
    type: 'mousemove',
    element: window,
    listener: onMouseMove,
  })

  // Reset dragging state on mouse up.
  const onMouseUp: EventListener = useCallback(
    (e) => {
      if (dragging) {
        e.preventDefault()
        setState({ ...DEFAULT_STATE, translate })
      }
    },
    [dragging, translate, setState]
  )
  useEventListener({
    type: 'mouseup',
    element: window,
    listener: onMouseUp,
  })

  const handleMouseDown: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setState({
      ...state,
      dragging: true,
      origin: { x: e.pageX - translate.x, y: e.pageY - translate.y },
      mouse: { x: e.pageX, y: e.pageY },
    })
    handleFocus?.()
  }

  const handleClick: React.MouseEventHandler = (e) => {
    handleFocus?.()
  }

  return open ? (
    <div className={clsx(OVERLAY, zIndex)} onClick={handleClick}>
      <section
        className={clsx(MODAL, dragging ? DRAGGING : NOT_DRAGGING)}
        ref={dialog}
      >
        <header className={HEADER}>
          {draggable ? (
            <button onMouseDown={handleMouseDown} className={DRAG_BUTTON}>
              <h2 className={TITLE}>{title}</h2>
            </button>
          ) : (
            <h2 className={TITLE}>{title}</h2>
          )}
          {handleOnClose ? (
            <button className={CLOSE_BUTTON} onClick={handleCloseClick}>
              <Icon icon={faTimes} mode="default" />
            </button>
          ) : null}
        </header>
        <div className={MODAL_BODY}>{children}</div>
      </section>
    </div>
  ) : null
}

Modal.displayName = 'Modal'
