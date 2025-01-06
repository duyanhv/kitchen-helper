import React from "react";

import { Provider as ColorModeProvider } from "./color-mode";
import { Provider as DrawerOpenProvider } from "./drawer-open";
import { Provider as MinimalModeProvider } from "./minimal-mode";
import { Provider as ShellLayoutProvder } from "./shell-layout";
import { Provider as TickEveryMinuteProvider } from "./tick-every-minute";

export { useSetThemePrefs, useThemePrefs } from "./color-mode";
export { useIsDrawerOpen, useSetDrawerOpen } from "./drawer-open";
export { useMinimalShellMode, useSetMinimalShellMode } from "./minimal-mode";
export { useTickEveryMinute } from "./tick-every-minute";

export function Provider({ children }: React.PropsWithChildren<{}>) {
  return (
    <ShellLayoutProvder>
      <DrawerOpenProvider>
          <MinimalModeProvider>
            <ColorModeProvider>
              <TickEveryMinuteProvider>{children}</TickEveryMinuteProvider>
            </ColorModeProvider>
          </MinimalModeProvider>
      </DrawerOpenProvider>
    </ShellLayoutProvder>
  );
}
