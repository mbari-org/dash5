// react-color.d.ts
declare module 'react-color' {
  import * as React from 'react'

  export interface ColorResult {
    hex: string
    rgb: { r: number; g: number; b: number; a: number }
    hsl: { h: number; s: number; l: number; a: number }
  }

  export interface ColorPickerProps {
    color?:
      | string
      | { hex: string }
      | { r: number; g: number; b: number; a?: number }
    onChange?: (color: ColorResult) => void
    onChangeComplete?: (color: ColorResult) => void
    disableAlpha?: boolean
    presetColors?: string[]
    styles?: Record<string, any>
    [key: string]: any
  }

  export class AlphaPicker extends React.Component<ColorPickerProps> {}
  export class BlockPicker extends React.Component<ColorPickerProps> {}
  export class ChromePicker extends React.Component<ColorPickerProps> {}
  export class CirclePicker extends React.Component<ColorPickerProps> {}
  export class CompactPicker extends React.Component<ColorPickerProps> {}
  export class GithubPicker extends React.Component<ColorPickerProps> {}
  export class HuePicker extends React.Component<ColorPickerProps> {}
  export class MaterialPicker extends React.Component<ColorPickerProps> {}
  export class PhotoshopPicker extends React.Component<ColorPickerProps> {}
  export class SketchPicker extends React.Component<ColorPickerProps> {}
  export class SliderPicker extends React.Component<ColorPickerProps> {}
  export class SwatchesPicker extends React.Component<ColorPickerProps> {}
  export class TwitterPicker extends React.Component<ColorPickerProps> {}

  // Alias for backward compatibility
  export const Sketch: typeof SketchPicker
}
