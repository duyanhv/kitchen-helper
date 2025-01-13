import React from "react";

import { Provider as LanguagesProvider } from "./languages";

export { useLanguagePrefs, useLanguagePrefsApi } from "./languages";
export { useHapticsDisabled } from "./disable-haptics";
import { Provider as DisableHapticsProvider } from "./disable-haptics";
import { Provider as FontScaleProvider } from "./font-scale";

export function Provider({ children }: React.PropsWithChildren<{}>) {
  return (
    <LanguagesProvider>
      <DisableHapticsProvider>
        <FontScaleProvider>{children}</FontScaleProvider>
      </DisableHapticsProvider>
    </LanguagesProvider>
  );
}
