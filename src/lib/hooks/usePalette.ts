import {useMemo} from 'react'
import {TextStyle, ViewStyle} from 'react-native'
import { useTheme } from '../../alf'


export interface UsePaletteValue {
  colors: PaletteColor
  view: ViewStyle
  viewLight: ViewStyle
  btn: ViewStyle
  border: ViewStyle
  borderDark: ViewStyle
  text: TextStyle
  textLight: TextStyle
  textInverted: TextStyle
  link: TextStyle
  icon: TextStyle
}
export function usePalette(color: PaletteColorName): UsePaletteValue {
  const theme = useTheme()
  return useMemo(() => {
    const palette = theme.atoms
    return {
      colors: palette,
      view: {
        backgroundColor: palette.bg.backgroundColor,
      },
      viewLight: {
        backgroundColor: palette.bg_contrast_100,
      },
      btn: {
        backgroundColor: palette.bg_contrast_100,
      },
      border: {
        borderColor: palette.border_contrast_low,
      },
      borderDark: {
        borderColor: palette.border_contrast_low,
      },
      text: {
        color: palette.text.color,
      },
      textLight: {
        color: palette.text.color,
      },
      textInverted: {
        color: palette.text_inverted.color,
      },
      link: {
        color: palette.text_contrast_high,
      },
      icon: {
        color: palette.text_contrast_high,
      },
    }
  }, [theme, color])
}

export type PaletteColorName =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'inverted'
  | 'error'
export type PaletteColor = {
  background: string
  backgroundLight: string
  text: string
  textLight: string
  textInverted: string
  link: string
  border: string
  borderDark: string
  icon: string
  [k: string]: string
}
export type Palette = Record<PaletteColorName, PaletteColor>

export type ShapeName = 'button' | 'bigButton' | 'smallButton'
export type Shapes = Record<ShapeName, ViewStyle>

export type TypographyVariant =
  | '2xl-thin'
  | '2xl'
  | '2xl-medium'
  | '2xl-bold'
  | '2xl-heavy'
  | 'xl-thin'
  | 'xl'
  | 'xl-medium'
  | 'xl-bold'
  | 'xl-heavy'
  | 'lg-thin'
  | 'lg'
  | 'lg-medium'
  | 'lg-bold'
  | 'lg-heavy'
  | 'md-thin'
  | 'md'
  | 'md-medium'
  | 'md-bold'
  | 'md-heavy'
  | 'sm-thin'
  | 'sm'
  | 'sm-medium'
  | 'sm-bold'
  | 'sm-heavy'
  | 'xs-thin'
  | 'xs'
  | 'xs-medium'
  | 'xs-bold'
  | 'xs-heavy'
  | 'title-2xl'
  | 'title-xl'
  | 'title-lg'
  | 'title'
  | 'title-sm'
  | 'post-text-lg'
  | 'post-text'
  | 'button'
  | 'button-lg'
  | 'mono'
export type Typography = Record<TypographyVariant, TextStyle>