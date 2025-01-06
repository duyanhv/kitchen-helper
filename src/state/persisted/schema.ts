import { z } from "zod";

import { deviceLanguageCodes, deviceLocales } from "@/locale/deviceLocales";
import { findSupportedAppLanguage } from "@/locale/helpers";
import { logger } from "@/logger";
export const KitchenRole = ["admin", "cook", "waiter", "guest"] as const;
export type KitchenRole = (typeof KitchenRole)[number];

/**
 * A account persisted to storage. Stored in the `accounts[]` array. Contains
 * base account info and access tokens.
 */
const accountSchema = z.object({
  did: z.string(),
  handle: z.string(),
  accessJwt: z.string().optional(),
  kitchenRole: z.enum(KitchenRole),
});
export type PersistedAccount = z.infer<typeof accountSchema>;

/**
 * The current account. Stored in the `currentAccount` field.
 *
 * In previous versions, this included tokens and other info. Now, it's used
 * only to reference the `did` field, and all other fields are marked as
 * optional. They should be considered deprecated and not used, but are kept
 * here for backwards compat.
 */
const currentAccountSchema = accountSchema.extend({
  handle: z.string().optional(),
});
export type PersistedCurrentAccount = z.infer<typeof currentAccountSchema>;

const schema = z.object({
  session: z.object({
    accounts: z.array(accountSchema),
    currentAccount: currentAccountSchema.optional(),
  }),
  colorMode: z.enum(["system", "light", "dark"]),
  darkTheme: z.enum(["dim", "dark"]).optional(),
  reminders: z.object({
    lastEmailConfirm: z.string().optional(),
  }),
  disableHaptics: z.boolean().optional(),
  languagePrefs: z.object({
    /**
     * The target language for translating posts.
     *
     * BCP-47 2-letter language code without region.
     */
    primaryLanguage: z.string(),
    /**
     * The language for UI translations in the app.
     *
     * BCP-47 2-letter language code with or without region,
     * to match with {@link AppLanguage}.
     */
    appLanguage: z.string(),
  }),
  onboarding: z.object({
    step: z.string(),
  }),
});

export type Schema = z.infer<typeof schema>;

export const defaults: Schema = {
  session: {
    accounts: [],
    currentAccount: undefined,
  },
  colorMode: "system",
  darkTheme: "dim",
  reminders: {
    lastEmailConfirm: undefined,
  },
  disableHaptics: false,
  languagePrefs: {
    primaryLanguage: deviceLanguageCodes[0] || "en",
    // try full language tag first, then fallback to language code
    appLanguage: findSupportedAppLanguage([
      deviceLocales.at(0)?.languageTag,
      deviceLanguageCodes[0],
    ]),
  },
  onboarding: {
    step: "Home",
  },
};

export function tryParse(rawData: string): Schema | undefined {
  let objData;
  try {
    objData = JSON.parse(rawData);
  } catch (e) {
    logger.error("persisted state: failed to parse root state from storage", {
      message: e,
    });
  }
  if (!objData) {
    return undefined;
  }
  const parsed = schema.safeParse(objData);
  if (parsed.success) {
    return objData;
  } else {
    const errors =
      parsed.error?.errors?.map((e) => ({
        code: e.code,
        // @ts-ignore exists on some types
        expected: e?.expected,
        path: e.path?.join("."),
      })) || [];
    logger.error(`persisted store: data failed validation on read`, { errors });
    return undefined;
  }
}

export function tryStringify(value: Schema): string | undefined {
  try {
    schema.parse(value);
    return JSON.stringify(value);
  } catch (e) {
    logger.error(`persisted state: failed stringifying root state`, {
      message: e,
    });
    return undefined;
  }
}
