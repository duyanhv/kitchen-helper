import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

import { HITSLOP_10 } from "@/lib/constants";
import { PressableScale } from "@/lib/custom-animations/PressableScale";
import { useHaptics } from "@/lib/haptics";
import { useMinimalShellHeaderTransform } from "@/lib/hooks/useMinimalShellTransform";
import { emitSoftReset } from "@/state/events";
import { useSession } from "@/state/session";
import { useShellLayout } from "@/state/shell/shell-layout";
import { Logo } from "@/view/icons/Logo";
import { atoms as a, useTheme } from "@/alf";
import * as Layout from "@/components/Layout";

export function HomeHeaderLayoutMobile({
  children,
}: {
  children: React.ReactNode;
  tabBarAnchor: JSX.Element | null | undefined;
}) {
  const t = useTheme();
  const { _ } = useLingui();
  const { headerHeight } = useShellLayout();
  const headerMinimalShellTransform = useMinimalShellHeaderTransform();
  const { hasSession } = useSession();
  const playHaptic = useHaptics();

  return (
    <Animated.View
      style={[
        t.atoms.bg,
        {
          left: 0,
          right: 0,
          // top: headerHeight,
        },
      ]}
      onLayout={(e) => {
        headerHeight.set(e.nativeEvent.layout.height);
      }}
    >
      <View style={[a.flex_row, a.align_center, a.justify_start, a.px_md]}>
        <Layout.Header.MenuButton />
        {children}
      </View>
    </Animated.View>
  );
}
