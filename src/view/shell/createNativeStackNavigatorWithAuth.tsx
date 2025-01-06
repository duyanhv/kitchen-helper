import * as React from "react";
import { View } from "react-native";
// Based on @react-navigation/native-stack/src/createNativeStackNavigator.ts
// MIT License
// Copyright (c) 2017 React Navigation Contributors
import {
  createNavigatorFactory,
  EventArg,
  ParamListBase,
  StackActionHelpers,
  StackActions,
  StackNavigationState,
  StackRouter,
  StackRouterOptions,
  useNavigationBuilder,
} from "@react-navigation/native";
import type {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
  NativeStackNavigatorProps,
} from "@react-navigation/native-stack";
import { NativeStackView } from "@react-navigation/native-stack";

import { isNative, isWeb } from "@/platform/detection";
import { atoms as a } from "@/alf";
import { useSession } from "../../state/session";

type NativeStackNavigationOptionsWithAuth = NativeStackNavigationOptions & {
  requireAuth?: boolean;
};

function NativeStackNavigator({
  id,
  initialRouteName,
  children,
  screenListeners,
  screenOptions,
  ...rest
}: NativeStackNavigatorProps) {
  const { hasSession } = useSession();
  // --- this is copy and pasted from the original native stack navigator ---
  const { state, descriptors, navigation, NavigationContent } =
    useNavigationBuilder<
      StackNavigationState<ParamListBase>,
      StackRouterOptions,
      StackActionHelpers<ParamListBase>,
      NativeStackNavigationOptionsWithAuth,
      NativeStackNavigationEventMap
    >(StackRouter, {
      id,
      initialRouteName,
      children,
      screenListeners,
      screenOptions,
    });
  React.useEffect(
    () =>
      // @ts-expect-error: there may not be a tab navigator in parent
      navigation?.addListener?.("tabPress", (e: any) => {
        const isFocused = navigation.isFocused();

        // Run the operation in the next frame so we're sure all listeners have been run
        // This is necessary to know if preventDefault() has been called
        requestAnimationFrame(() => {
          if (
            state.index > 0 &&
            isFocused &&
            !(e as EventArg<"tabPress", true>).defaultPrevented
          ) {
            // When user taps on already focused tab and we're inside the tab,
            // reset the stack to replicate native behaviour
            navigation.dispatch({
              ...StackActions.popToTop(),
              target: state.key,
            });
          }
        });
      }),
    [navigation, state.index, state.key]
  );

  // --- our custom logic starts here ---
  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute.key];
  const activeRouteRequiresAuth = activeDescriptor.options.requireAuth ?? false;
  // if (!hasSession && (!PWI_ENABLED || activeRouteRequiresAuth || isNative)) {
  //   return <LoggedOut />
  // }
  // if (hasSession && currentAccount?.signupQueued) {
  //   return <SignupQueued />
  // }
  // if (showLoggedOut) {
  //   return <LoggedOut onDismiss={() => setShowLoggedOut(false)} />
  // }
  // if (currentAccount?.status === 'deactivated') {
  //   return <Deactivated />
  // }
  // if (onboardingState.isActive) {
  //   return <Onboarding />
  // }

  const newDescriptors: typeof descriptors = {};
  for (let key in descriptors) {
    const descriptor = descriptors[key];
    const requireAuth = descriptor.options.requireAuth ?? false;
    newDescriptors[key] = {
      ...descriptor,
      render() {
        if (requireAuth && !hasSession) {
          return <View />;
        } else {
          return descriptor.render();
        }
      },
    };
  }

  return (
    <NavigationContent>
      <View role="main" style={a.flex_1}>
        <NativeStackView
          {...rest}
          state={state}
          navigation={navigation}
          descriptors={newDescriptors}
          describe={(route, placeholder) => descriptors[route.key]}
        />
      </View>
    </NavigationContent>
  );
}

export const createNativeStackNavigatorWithAuth = createNavigatorFactory<
  StackNavigationState<ParamListBase>,
  NativeStackNavigationOptionsWithAuth,
  NativeStackNavigationEventMap,
  typeof NativeStackNavigator
>(NativeStackNavigator);
