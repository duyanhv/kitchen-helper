import { timeout } from "@/lib/async/timeout";
import { useModalControls } from "@/state/modals";
import {
  CommonActions,
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  StackActions,
} from "@react-navigation/native";
import React from "react";
import {
  AllNavigatorParams,
  BottomTabNavigatorParams,
  HomeTabNavigatorParams,
  RouteParams,
  State,
} from "@/lib/routes/types";
import { router } from "@/routes";
import { isNative } from "./platform/detection";
import { buildStateObject } from "@/lib/routes/helpers";
import { createNativeStackNavigatorWithAuth } from "@/view/shell/createNativeStackNavigatorWithAuth";
import { attachRouteToLogEvents, logEvent } from "./lib/statsig/statsig";
import { useTheme } from "./alf";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { i18n, MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { SettingsScreen } from "@/screens/Settings/Settings";
import { BottomBar } from "@/view/shell/bottom-bar/BottomBar";
import { useColorSchemeStyle } from "./lib/hooks/useColorSchemeStyle";
import { HomeScreen } from "@/screens/Home/Home";

const navigationRef = createNavigationContainerRef<AllNavigatorParams>();
const HomeTab = createNativeStackNavigatorWithAuth<HomeTabNavigatorParams>();
const Tab = createBottomTabNavigator<BottomTabNavigatorParams>();

/**
 * These "common screens" are reused across stacks.
 */
function commonScreens(Stack: typeof HomeTab, unreadCountLabel?: string) {
  const title = (page: MessageDescriptor) => {
    return i18n._(page);
  };
  return (
    <>
      <Stack.Screen
        name="Settings"
        getComponent={() => SettingsScreen}
        options={{ title: title(msg`Settings`), requireAuth: false }}
      />
    </>
  );
}

/**
 * The TabsNavigator is used by native mobile to represent the routes
 * in 3 distinct tab-stacks with a different root screen on each.
 */
function TabsNavigator() {
  const tabBar = React.useCallback(
    (props: JSX.IntrinsicAttributes & BottomTabBarProps) => (
      <BottomBar {...props} />
    ),
    []
  );

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: {
          display: "none",
        },
      }}
      // tabBar={tabBar}
    >
      <Tab.Screen name="HomeTab" getComponent={() => HomeTabNavigator} />
    </Tab.Navigator>
  );
}

function HomeTabNavigator() {
  const t = useTheme();

  return (
    <HomeTab.Navigator
      screenOptions={{
        animationDuration: 285,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerShown: false,
        contentStyle: t.atoms.bg,
      }}
    >
      <HomeTab.Screen name="Home" getComponent={() => HomeScreen} />
      <HomeTab.Screen name="Start" getComponent={() => HomeScreen} />
      {commonScreens(HomeTab)}
    </HomeTab.Navigator>
  );
}

/**
 * The RoutesContainer should wrap all components which need access
 * to the navigation context.
 */

const LINKING = {
  // TODO figure out what we are going to use
  prefixes: ["bsky://", "bluesky://", "https://bsky.app"],

  getPathFromState(state: State) {
    // find the current node in the navigation tree
    let node = state.routes[state.index || 0];
    while (node.state?.routes && typeof node.state?.index === "number") {
      node = node.state?.routes[node.state?.index];
    }

    // build the path
    const route = router.matchName(node.name);
    if (typeof route === "undefined") {
      return "/"; // default to home
    }
    return route.build((node.params || {}) as RouteParams);
  },

  getStateFromPath(path: string) {
    const [name, params] = router.matchPath(path);

    // Any time we receive a url that starts with `intent/` we want to ignore it here. It will be handled in the
    // intent handler hook. We should check for the trailing slash, because if there isn't one then it isn't a valid
    // intent
    // On web, there is no route state that's created by default, so we should initialize it as the home route. On
    // native, since the home tab and the home screen are defined as initial routes, we don't need to return a state
    // since it will be created by react-navigation.
    if (path.includes("intent/")) {
      if (isNative) return;
      return buildStateObject("Flat", "Home", params);
    }

    if (isNative) {
      if (name === "Search") {
        return buildStateObject("SearchTab", "Search", params);
      }
      if (name === "Notifications") {
        return buildStateObject("NotificationsTab", "Notifications", params);
      }
      if (name === "Home") {
        return buildStateObject("HomeTab", "Home", params);
      }
      if (name === "Messages") {
        return buildStateObject("MessagesTab", "Messages", params);
      }
      // if the path is something else, like a post, profile, or even settings, we need to initialize the home tab as pre-existing state otherwise the back button will not work
      return buildStateObject("HomeTab", name, params, [
        {
          name: "Home",
          params: {},
        },
      ]);
    } else {
      const res = buildStateObject("Flat", name, params);
      return res;
    }
  },
};

function RoutesContainer({ children }: React.PropsWithChildren<{}>) {
  const theme = useColorSchemeStyle(DefaultTheme, DarkTheme);
  const { openModal } = useModalControls();
  const prevLoggedRouteName = React.useRef<string | undefined>(undefined);

  function onReady() {
    prevLoggedRouteName.current = getCurrentRouteName();

    // Setup verification things or something related to do with setting up the account of User
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={LINKING}
      theme={theme}
      onReady={() => {
        attachRouteToLogEvents(getCurrentRouteName);
        logModuleInitTime();
        onReady();
      }}
    >
      {children}
    </NavigationContainer>
  );
}

function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  } else {
    return undefined;
  }
}

/**
 * These helpers can be used from outside of the RoutesContainer
 * (eg in the state models).
 */

function navigate<K extends keyof AllNavigatorParams>(
  name: K,
  params?: AllNavigatorParams[K]
) {
  if (navigationRef.isReady()) {
    return Promise.race([
      new Promise<void>((resolve) => {
        const handler = () => {
          resolve();
          navigationRef.removeListener("state", handler);
        };
        navigationRef.addListener("state", handler);

        // @ts-ignore I dont know what would make typescript happy but I have a life -prf
        navigationRef.navigate(name, params);
      }),
      timeout(1e3),
    ]);
  }
  return Promise.resolve();
}

function resetToTab(tabName: "HomeTab") {
  if (navigationRef.isReady()) {
    navigate(tabName);
    if (navigationRef.canGoBack()) {
      navigationRef.dispatch(StackActions.popToTop()); //we need to check .canGoBack() before calling it
    }
  }
}

// returns a promise that resolves after the state reset is complete
function reset(): Promise<void> {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: isNative ? "HomeTab" : "Home" }],
      })
    );
    return Promise.race([
      timeout(1e3),
      new Promise<void>((resolve) => {
        const handler = () => {
          resolve();
          navigationRef.removeListener("state", handler);
        };
        navigationRef.addListener("state", handler);
      }),
    ]);
  } else {
    return Promise.resolve();
  }
}
let didInit = false;
function logModuleInitTime() {
  if (didInit) {
    return;
  }
  didInit = true;

  const initMs = Math.round(
    // @ts-ignore Emitted by Metro in the bundle prelude
    performance.now() - global.__BUNDLE_START_TIME__
  );
  console.log(`Time to first paint: ${initMs} ms`);
  logEvent("init", {
    initMs,
  });

  if (__DEV__) {
    // This log is noisy, so keep false committed
    const shouldLog = false;
    // Relies on our patch to polyfill.js in metro-runtime
    const initLogs = (global as any).__INIT_LOGS__;
    if (shouldLog && Array.isArray(initLogs)) {
      console.log(initLogs.join("\n"));
    }
  }
}

export { navigate, reset, resetToTab, RoutesContainer, TabsNavigator };
