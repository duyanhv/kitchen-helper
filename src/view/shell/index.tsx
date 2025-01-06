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
      <View style={[atoms.h_full]}>
        <TabsNavigator />
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
