import {ColorSchemeName, useColorScheme} from 'react-native'

import {useThemePrefs} from '@/state/shell'
import {ThemeName} from '@/alf/types'

export function useColorModeTheme(): ThemeName {
  const theme = useThemeName()

  return theme
}

export function useThemeName(): ThemeName {
  const colorScheme = useColorScheme()
  const {colorMode, darkTheme} = useThemePrefs()

  return getThemeName(colorScheme, colorMode, darkTheme)
}

function getThemeName(
  colorScheme: ColorSchemeName,
  colorMode: 'system' | 'light' | 'dark',
  darkTheme?: ThemeName,
) {
  if (
    (colorMode === 'system' && colorScheme === 'light') ||
    colorMode === 'light'
  ) {
    return 'light'
  } else {
    return darkTheme ?? 'dim'
  }
}

