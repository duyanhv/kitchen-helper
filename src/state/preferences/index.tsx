import React from "react";

import { Provider as LanguagesProvider } from "./languages";

export { useLanguagePrefs, useLanguagePrefsApi } from "./languages";
export { useHapticsDisabled } from "./disable-haptics";
import { Provider as DisableHapticsProvider } from "./disable-haptics";

export function Provider({ children }: React.PropsWithChildren<{}>) {
  return (
    <LanguagesProvider>
      <DisableHapticsProvider>{children}</DisableHapticsProvider>
    </LanguagesProvider>
  );
}
