import React, { ComponentProps } from "react";
import { GestureResponderEvent, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";

import { PressableScale } from "@/lib/custom-animations/PressableScale";
import { useHaptics } from "@/lib/haptics";
import { useDedupe } from "@/lib/hooks/useDedupe";
import { useMinimalShellFooterTransform } from "@/lib/hooks/useMinimalShellTransform";
import { usePalette } from "@/lib/hooks/usePalette";
import { clamp } from "@/lib/numbers";
import { getTabState, TabState } from "@/lib/routes/helpers";
import { useGate } from "@/lib/statsig/statsig";
import { s } from "@/lib/styles";
import { emitSoftReset } from "@/state/events";
import { useShellLayout } from "@/state/shell/shell-layout";
import { useCloseAllActiveElements } from "@/state/util";
import { Button } from "@/components/Button";
import { Logo } from "@/view/icons/Logo";
import { Logotype } from "@/view/icons/Logotype";
import { atoms as a } from "@/alf";
import { useDialogControl } from "@/components/Dialog";
import {
  HomeOpen_Filled_Corner0_Rounded as HomeFilled,
  HomeOpen_Stoke2_Corner0_Rounded as Home,
} from "@/components/icons/HomeOpen";

import { styles } from "./BottomBarStyles";
import { msg } from "@lingui/core/macro";
import { Text } from "@/components/Typography";
import { useNavigationTabState } from "@/lib/hooks/useNavigationTabState";
import { useSession } from "../../../state/session";
import { AppLanguageDropdown } from "../../../components/AppLanguageDropdown";
import { ButtonText } from "../../../components/Button";

type TabOptions =
  | "Home"
  | "Search"
  | "Notifications"
  | "MyProfile"
  | "Feeds"
  | "Messages";

export function BottomBar({ navigation }: BottomTabBarProps) {
  const { hasSession, currentAccount } = useSession();
  const pal = usePalette("default");
  const { _ } = useLingui();
  const safeAreaInsets = useSafeAreaInsets();
  const { footerHeight } = useShellLayout();
  const {
    isAtHome,
    isAtSearch,
    isAtNotifications,
    isAtMyProfile,
    isAtMessages,
  } = useNavigationTabState();
  const footerMinimalShellTransform = useMinimalShellFooterTransform();
  const closeAllActiveElements = useCloseAllActiveElements();
  const dedupe = useDedupe();
  const accountSwitchControl = useDialogControl();
  const playHaptic = useHaptics();
  const gate = useGate();
  const iconWidth = 28;

  const onPressTab = React.useCallback(
    (tab: TabOptions) => {
      const state = navigation.getState();
      const tabState = getTabState(state, tab);
      if (tabState === TabState.InsideAtRoot) {
        emitSoftReset();
      } else if (tabState === TabState.Inside) {
        dedupe(() => navigation.dispatch(StackActions.popToTop()));
      } else {
        dedupe(() => navigation.navigate(`${tab}Tab`));
      }
    },
    [navigation, dedupe]
  );
  const onPressHome = React.useCallback(() => onPressTab("Home"), [onPressTab]);
  const onPressSearch = React.useCallback(
    () => onPressTab("Search"),
    [onPressTab]
  );
  const onPressNotifications = React.useCallback(
    () => onPressTab("Notifications"),
    [onPressTab]
  );
  const onPressProfile = React.useCallback(() => {
    onPressTab("MyProfile");
  }, [onPressTab]);
  const onPressMessages = React.useCallback(() => {
    onPressTab("Messages");
  }, [onPressTab]);

  const onLongPressProfile = React.useCallback(() => {
    playHaptic();
    accountSwitchControl.open();
  }, [accountSwitchControl, playHaptic]);

  return (
    <>
      <Animated.View
        layout={LinearTransition}
        style={[
          styles.bottomBar,
          pal.view,
          pal.border,
          { paddingBottom: clamp(safeAreaInsets.bottom, 15, 60) },
          // footerMinimalShellTransform,
        ]}
        // onLayout={(e) => {
        //   footerHeight.set(e.nativeEvent.layout.height);
        // }}
      >
        {hasSession ? (
          <>
            <Btn
              testID="bottomBarHomeBtn"
              icon={
                isAtHome ? (
                  <HomeFilled
                    width={iconWidth + 1}
                    style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
                  />
                ) : (
                  <Home
                    width={iconWidth + 1}
                    style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
                  />
                )
              }
              onPress={onPressHome}
              accessibilityRole="tab"
              accessibilityLabel={_(msg`Home`)}
              accessibilityHint=""
            />
          </>
        ) : (
          <>
            <View
              style={[
                {
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  paddingBottom: 2,
                  paddingLeft: 14,
                  paddingRight: 6,
                  gap: 8,
                },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Logo width={28} />

                <View>
                  <AppLanguageDropdown />
                </View>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Button
                  onPress={() => {}}
                  accessibilityHint={_(msg`Sign in`)}
                  accessibilityLabel={_(msg`Sign in`)}
                  variant="solid"
                  color="primary"
                  label={_(msg`Sign in`)}
                  size="small"
                >
                  <ButtonText>
                    <Trans>Sign in</Trans>
                  </ButtonText>
                </Button>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
}

interface BtnProps
  extends Pick<
    ComponentProps<typeof PressableScale>,
    | "accessible"
    | "accessibilityRole"
    | "accessibilityHint"
    | "accessibilityLabel"
  > {
  testID?: string;
  icon: JSX.Element;
  notificationCount?: string;
  hasNew?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
}

function Btn({
  testID,
  icon,
  hasNew,
  notificationCount,
  onPress,
  onLongPress,
  accessible,
  accessibilityHint,
  accessibilityLabel,
}: BtnProps) {
  return (
    <PressableScale
      testID={testID}
      style={[styles.ctrl, a.flex_1]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      targetScale={0.8}
    >
      {icon}
      {notificationCount ? (
        <View style={[styles.notificationCount, a.rounded_full]}>
          <Text style={styles.notificationCountLabel}>{notificationCount}</Text>
        </View>
      ) : hasNew ? (
        <View style={[styles.hasNewBadge, a.rounded_full]} />
      ) : null}
    </PressableScale>
  );
}
