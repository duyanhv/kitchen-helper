import { useTheme, atoms as a } from "@/alf";
import { useNavigationTabState } from "@/lib/hooks/useNavigationTabState";
import { getTabState, TabState } from "@/lib/routes/helpers";
import { NavigationProp } from "@/lib/routes/types";
import { emitSoftReset } from "@/state/events";
import { useSession } from "@/state/session";
import { useSetDrawerOpen } from "@/state/shell";
import { StackActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "../com/util/Views";
import { Text } from "@/components/Typography";
import { Divider } from "@/components/Divider";
import Slider from "@react-native-community/slider";
import {
  useFontScale,
  useSetFontScale,
} from "../../state/preferences/font-scale";
import { Trans } from "@lingui/react/macro";
let DrawerContent = ({}: React.PropsWithoutRef<{}>): React.ReactNode => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const setDrawerOpen = useSetDrawerOpen();
  const navigation = useNavigation<NavigationProp>();
  const {
    isAtHome,
    isAtSearch,
    isAtFeeds,
    isAtNotifications,
    isAtMyProfile,
    isAtMessages,
  } = useNavigationTabState();
  const { hasSession, currentAccount } = useSession();

  // events
  // =

  const onPressTab = React.useCallback(
    (tab: string) => {
      const state = navigation.getState();
      setDrawerOpen(true);
      const tabState = getTabState(state, tab);
      if (tabState === TabState.InsideAtRoot) {
        emitSoftReset();
      } else if (tabState === TabState.Inside) {
        navigation.dispatch(StackActions.popToTop());
      } else {
        // @ts-ignore must be Home, Search, Notifications, or MyProfile
        navigation.navigate(`${tab}Tab`);
      }
    },
    [navigation, setDrawerOpen, currentAccount]
  );

  const onPressHome = React.useCallback(() => onPressTab("Home"), [onPressTab]);

  const onPressSearch = React.useCallback(
    () => onPressTab("Search"),
    [onPressTab]
  );

  const onPressMessages = React.useCallback(
    () => onPressTab("Messages"),
    [onPressTab]
  );

  const onPressNotifications = React.useCallback(
    () => onPressTab("Notifications"),
    [onPressTab]
  );

  const onPressProfile = React.useCallback(() => {
    onPressTab("MyProfile");
  }, [onPressTab]);

  const onPressSettings = React.useCallback(() => {
    navigation.navigate("Settings");
    setDrawerOpen(false);
  }, [navigation, setDrawerOpen]);

  return (
    <View
      testID="drawer"
      style={[a.flex_1, a.border_r, t.atoms.bg, t.atoms.border_contrast_low]}
    >
      <ScrollView style={[a.flex_1]} contentContainerStyle={[{}]}>
        <View style={[a.gap_md, a.p_md, { backgroundColor: "#D9EDFE" }]}>
          <Text style={[a.text_4xl, a.font_bold]}>QUÁN CƠM ANH ANH</Text>
          <Text style={[a.text_lg]}>FnB ID: 73237</Text>
          <Divider />
          <View style={[a.flex_row, a.gap_md]}>
            <View
              style={[
                a.rounded_full,
                a.justify_center,
                a.align_center,
                { backgroundColor: "#E7EAFE", width: 80, height: 80 },
              ]}
            >
              <Text style={[a.text_3xl, a.font_bold]}>NG</Text>
            </View>
            <View style={[a.justify_center, a.gap_xs]}>
              <Text style={[a.text_xl, a.font_bold]}>Nguyễn Văn B</Text>
              <Text style={[a.text_md]}>Quản lý</Text>
            </View>
          </View>
          <Divider />

          <FontScaleSlider />
        </View>
      </ScrollView>
    </View>
  );
};

export const FontScaleSlider = () => {
  const fontScale = useFontScale();
  const setFontScale = useSetFontScale();
  return (
    <View>
      <Text>
        <Trans>Font scale</Trans>
      </Text>
      <Slider
        style={{ width: "100%", height: 50 }}
        minimumValue={1}
        value={fontScale}
        maximumValue={10}
        onValueChange={(value) => {
          setFontScale(value);
        }}
      />
    </View>
  );
};

DrawerContent = React.memo(DrawerContent);
export { DrawerContent };
