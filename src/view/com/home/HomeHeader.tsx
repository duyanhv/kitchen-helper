import React from "react";
import { useNavigation } from "@react-navigation/native";

import { NavigationProp } from "@/lib/routes/types";
import { useSession } from "@/state/session";
import { RenderTabBarFnProps } from "@/view/com/pager/Pager";
import { HomeHeaderLayout } from "./HomeHeaderLayout";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { TabBar } from "../pager/Tabbar";
import { atoms } from "@/alf";

export function HomeHeader(
  props: RenderTabBarFnProps & {
    testID?: string;
    onPressSelected: () => void;
  }
) {
  const { _ } = useLingui();

  const { hasSession } = useSession();
  const navigation = useNavigation<NavigationProp>();

  const onSelect = React.useCallback(
    (index: number) => {
      if (props.onSelect) {
        props.onSelect(index);
      }
    },
    [props]
  );

  return (
    <HomeHeaderLayout tabBarAnchor={props.tabBarAnchor}>
      <TabBar
        key={"tab-bar"}
        onPressSelected={props.onPressSelected}
        selectedPage={props.selectedPage}
        onSelect={onSelect}
        testID={props.testID}
        items={[_(msg`Ticket`), _(msg`Processing by items`)]}
        dragProgress={props.dragProgress}
        dragState={props.dragState}
        contentStyle={[{ flexGrow: 0 }, atoms.py_md]}
        contentItemTextStyle={[atoms.text_xl]}
      />
    </HomeHeaderLayout>
  );
}
