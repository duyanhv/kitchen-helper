import * as SplashScreen from "expo-splash-screen";
import { AppProfiler } from "./AppProfiler";
import { KeyboardControllerProvider } from "./lib/hooks/useEnableKeyboardController";
import { Provider as PrefsStateProvider } from "@/state/preferences";
import I18nProvider from "@/locale/i18nProvider";
import { Provider as ShellStateProvider } from "@/state/shell";
import { Provider as ModalStateProvider } from "@/state/modals";
import { Provider as DialogStateProvider } from "@/state/dialogs";
import {
  Provider as SessionProvider,
  SessionAccount,
  useSession,
  useSessionApi,
} from "@/state/session";
import { BottomSheetProvider } from "../modules/bottom-sheet";
import { Provider as LightStatusBarProvider } from "@/state/shell/light-status-bar";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { useLingui } from "@lingui/react";
import React from "react";
import { useColorModeTheme } from "@/alf/util/useColorModeTheme";
import { ThemeProvider as Alf } from "@/alf";
import { isAndroid, isIOS } from "./platform/detection";
import * as SystemUI from "expo-system-ui";
import * as ScreenOrientation from "expo-screen-orientation";
import { Splash } from "@/Splash";
import { RootSiblingParent } from "react-native-root-siblings";
import { QueryProvider } from "./lib/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { s } from "./lib/styles";
import { Shell } from "@/view/shell";

SplashScreen.preventAutoHideAsync();
if (isIOS) {
  SystemUI.setBackgroundColorAsync("black");
}
if (isAndroid) {
  // iOS is handled by the config plugin -sfn
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
}

function InnerApp() {
  const [isReady, setIsReady] = React.useState(true);
  const { currentAccount } = useSession();
  const theme = useColorModeTheme();
  const { _ } = useLingui();
  return (
    <Alf theme={theme}>
      <Splash isReady={isReady}>
        <RootSiblingParent>
          <React.Fragment
            // Resets the entire tree below when it changes:
            key={currentAccount?.did}
          >
            <QueryProvider currentDid={currentAccount?.did}>
              <GestureHandlerRootView style={s.h100pct}>
                <Shell />
              </GestureHandlerRootView>
            </QueryProvider>
          </React.Fragment>
        </RootSiblingParent>
      </Splash>
    </Alf>
  );
}

function App() {
  return (
    <AppProfiler>
      <KeyboardControllerProvider>
        <SessionProvider>
          <PrefsStateProvider>
            <I18nProvider>
              <ShellStateProvider>
                <ModalStateProvider>
                  <DialogStateProvider>
                    <BottomSheetProvider>
                      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                        <LightStatusBarProvider>
                          <InnerApp />
                        </LightStatusBarProvider>
                      </SafeAreaProvider>
                    </BottomSheetProvider>
                  </DialogStateProvider>
                </ModalStateProvider>
              </ShellStateProvider>
            </I18nProvider>
          </PrefsStateProvider>
        </SessionProvider>
      </KeyboardControllerProvider>
    </AppProfiler>
  );
}

export default App;
