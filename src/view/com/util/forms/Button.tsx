import React from 'react'
import {
  ActivityIndicator,
  GestureResponderEvent,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import {choose} from '@/lib/functions'
import { useTheme } from '@/alf'
import { Text } from '@/components/Typography'

export type ButtonType =
  | 'default'

// Augment type for react-native-web (see https://github.com/necolas/react-native-web/issues/1684#issuecomment-766451866)
declare module 'react-native' {
  interface PressableStateCallbackType {
    // @ts-ignore web only
    hovered?: boolean
    focused?: boolean
  }
}

// TODO: Enforce that button always has a label
export function Button({
  type = 'default',
  label,
  style,
  labelContainerStyle,
  labelStyle,
  onPress,
  children,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLabelledBy,
  onAccessibilityEscape,
  withLoading = false,
  disabled = false,
}: React.PropsWithChildren<{
  type?: ButtonType
  label?: string
  style?: StyleProp<ViewStyle>
  labelContainerStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  onPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void | Promise<void>
  testID?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityLabelledBy?: string
  onAccessibilityEscape?: () => void
  withLoading?: boolean
  disabled?: boolean
}>) {
  const theme = useTheme()
  const typeOuterStyle = choose<ViewStyle, Record<ButtonType, ViewStyle>>(
    type,
    {
      default: {
        backgroundColor: theme.atoms.bg.backgroundColor,
      },
    },
  )
  const typeLabelStyle = choose<TextStyle, Record<ButtonType, TextStyle>>(
    type,
    {
      default: {
        color: theme.atoms.text.color
      },
    },
  )

  const [isLoading, setIsLoading] = React.useState(false)
  const onPressWrapped = React.useCallback(
    async (event: GestureResponderEvent) => {
      event.stopPropagation()
      event.preventDefault()
      withLoading && setIsLoading(true)
      await onPress?.(event)
      withLoading && setIsLoading(false)
    },
    [onPress, withLoading],
  )

  const getStyle = React.useCallback(
    (state: PressableStateCallbackType) => {
      const arr = [typeOuterStyle, styles.outer, style]
      if (state.pressed) {
        arr.push({opacity: 0.6})
      } else if (state.hovered) {
        arr.push({opacity: 0.8})
      }
      return arr
    },
    [typeOuterStyle, style],
  )

  const renderChildern = React.useCallback(() => {
    if (!label) {
      return children
    }

    return (
      <View style={[styles.labelContainer, labelContainerStyle]}>
        {label && withLoading && isLoading ? (
          <ActivityIndicator size={12} color={typeLabelStyle.color} />
        ) : null}
        <Text style={[typeLabelStyle, labelStyle]}>
          {label}
        </Text>
      </View>
    )
  }, [
    children,
    label,
    withLoading,
    isLoading,
    labelContainerStyle,
    typeLabelStyle,
    labelStyle,
  ])

  return (
    <Pressable
      style={getStyle}
      onPress={onPressWrapped}
      disabled={disabled || isLoading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityLabelledBy={accessibilityLabelledBy}
      onAccessibilityEscape={onAccessibilityEscape}>
      {renderChildern}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
})
