import { useDialogStateControlContext } from "@/state/dialogs";
import { useLightStatusBar } from "@/state/shell/light-status-bar";
import { atoms, select, useTheme } from "@/alf";
import { useCallback, useEffect } from "react";
import { setNavigationBar } from "@/alf/util/navigationBar";
import { BackHandler, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { isAndroid, isIOS } from "@/platform/detection";
import { RoutesContainer, TabsNavigator } from "@/Navigation";
import { useIsDrawerOpen, useSetDrawerOpen } from "@/state/shell";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { isStateAtTabRoot } from "@/lib/routes/helpers";
import { useCloseAnyActiveElement } from "@/state/util";
import { ModalsContainer } from "@/view/com/modals/Modal";
import { BottomSheetOutlet } from "../../../modules/bottom-sheet";
import { useDedupe } from "@/lib/hooks/useDedupe";
import { useSession } from "@/state/session";
import { Drawer } from "react-native-drawer-layout";
import { DrawerContent } from "./Drawer";

function ShellInner() {
  const t = useTheme();
  const isDrawerOpen = useIsDrawerOpen();
  const setIsDrawerOpen = useSetDrawerOpen();
  const winDim = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onOpenDrawer = useCallback(
    () => setIsDrawerOpen(true),
    [setIsDrawerOpen]
  );
  const onCloseDrawer = useCallback(
    () => setIsDrawerOpen(false),
    [setIsDrawerOpen]
  );
  const canGoBack = useNavigationState((state) => !isStateAtTabRoot(state));
  const { hasSession } = useSession();
  const closeAnyActiveElement = useCloseAnyActiveElement();

  const renderDrawerContent = useCallback(() => <DrawerContent />, []);
  useEffect(() => {
    if (isAndroid) {
      const listener = BackHandler.addEventListener("hardwareBackPress", () => {
        return closeAnyActiveElement();
      });

      return () => {
        listener.remove();
      };
    }
  }, [closeAnyActiveElement]);

  const swipeEnabled = !canGoBack && hasSession;
  return (
    <>
      <View
        style={[
          atoms.h_full,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Drawer
          renderDrawerContent={renderDrawerContent}
          drawerStyle={{ width: Math.min(400, winDim.width * 0.8) }}
          // configureGestureHandler={(handler) => {
          //   if (swipeEnabled) {
          //     if (isDrawerOpen) {
          //       return handler.activeOffsetX([-1, 1]);
          //     } else {
          //       return (
          //         handler
          //           // Any movement to the left is a pager swipe
          //           // so fail the drawer gesture immediately.
          //           .failOffsetX(-1)
          //           // Don't rush declaring that a movement to the right
          //           // is a drawer swipe. It could be a vertical scroll.
          //           .activeOffsetX(5)
          //       );
          //     }
          //   } else {
          //     // Fail the gesture immediately.
          //     // This seems more reliable than the `swipeEnabled` prop.
          //     // With `swipeEnabled` alone, the gesture may freeze after toggling off/on.
          //     return handler.failOffsetX([0, 0]).failOffsetY([0, 0]);
          //   }
          // }}
          open={isDrawerOpen}
          onOpen={onOpenDrawer}
          onClose={onCloseDrawer}
          swipeEdgeWidth={winDim.width}
          swipeEnabled={false}
          swipeMinVelocity={100}
          swipeMinDistance={10}
          drawerType={"front"}
          overlayStyle={{
            backgroundColor: select(t.name, {
              light: "rgba(16, 133, 254, 0.1)",
              dark: "rgba(16, 133, 254, 0.1)",
              dim: "rgba(10, 13, 16, 0.8)",
            }),
          }}
        >
          <TabsNavigator />
        </Drawer>
      </View>
      <ModalsContainer />
      <BottomSheetOutlet />
    </>
  );
}

export const Shell: React.FC = function ShellImpl() {
  const { fullyExpandedCount } = useDialogStateControlContext();
  const lightStatusBar = useLightStatusBar();
  const t = useTheme();
  useEffect(() => {
    setNavigationBar("theme", t);
  }, [t]);

  return (
    <View testID="mobileShellView" style={[atoms.h_full, t.atoms.bg]}>
      <StatusBar
        style={
          t.name !== "light" ||
          (isIOS && fullyExpandedCount > 0) ||
          lightStatusBar
            ? "light"
            : "dark"
        }
        animated
      />
      <RoutesContainer>
        <ShellInner />
      </RoutesContainer>
    </View>
  );
};
