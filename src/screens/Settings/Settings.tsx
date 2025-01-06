import {
  CommonNavigatorParams,
  NativeStackScreenProps,
} from "@/lib/routes/types";
import * as Layout from "@/components/Layout";
import { Trans } from "@lingui/react/macro";

type Props = NativeStackScreenProps<CommonNavigatorParams, "Settings">;
export function SettingsScreen({}: Props) {
  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Settings</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
    </Layout.Screen>
  );
}
