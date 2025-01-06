import {
  CommonNavigatorParams,
  HomeTabNavigatorParams,
  NativeStackScreenProps,
} from "@/lib/routes/types";

import * as Layout from "@/components/Layout";
import { Trans } from "@lingui/react/macro";
import { ScrollView } from "@/view/com/util/Views";
import { atoms, useTheme } from "@/alf";
import { View } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/Typography";
import { useState } from "react";
import { TouchableOpacity } from "@discord/bottom-sheet";
import { Button, ButtonIcon } from "@/components/Button";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "@/components/icons/Plus";
import { SubtractIcon as Subtract } from "@/components/icons/Subtract";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

type Props = NativeStackScreenProps<HomeTabNavigatorParams, "Home">;
export function HomeScreen({}: Props) {
  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Home</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
      </Layout.Header.Outer>
      <OrderItem />
    </Layout.Screen>
  );
}

export function OrderItem() {
  const insets = useSafeAreaInsets();
  const [orderItems, setOrderItems] = useState<{ id: number; total: number }[]>(
    []
  );
  const addItem = ({ id, total }: { id: number; total: number }) => {
    const existingItem = orderItems.find((item) => item.id === id);
    if (existingItem?.total === 20) {
      return;
    }
    if (existingItem) {
      // Update existing item
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, total: item.total + total } : item
        )
      );
    } else {
      // Add new item
      setOrderItems((prev) => [...prev, { id, total }]);
    }
  };
  const removeItem = ({ id, total }: { id: number; total: number }) => {
    const existingItem = orderItems.find((item) => item.id === id);

    if (existingItem) {
      if (existingItem.total === 1) {
        setOrderItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setOrderItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, total: item.total - total } : item
          )
        );
      }
    }
  };

  const getItemById = (id: number) => orderItems.find((item) => item.id === id);

  const t = useTheme();
  const basketLabel = React.useMemo(() => {
    const result = {
      items: 0,
      price: 0,
    };
    if (orderItems.length === 0) {
      result;
    }

    orderItems.forEach((item) => {
      const itemDetail = FOOD_ITEMS.find((foodItem) => foodItem.id === item.id);
      result.items += item.total;
      result.price += item.total * (itemDetail?.price ?? 0);
    });
    return result;
  }, [orderItems]);
  return (
    <View style={[atoms.flex_1]}>
      <ScrollView
        contentContainerStyle={[
          atoms.flex_wrap,
          atoms.flex_row,
          atoms.gap_md,
          atoms.justify_center,
          atoms.align_start,
          {
            paddingTop: 30,
            paddingBottom: 100
          },
        ]}
      >
        {FOOD_ITEMS.map((item) => (
          <FoodItem
            key={item.id}
            item={item}
            total={getItemById(item.id)?.total}
            onAddItem={(id) => addItem({ id, total: 1 })}
            onRemoveItem={(id) => removeItem({ id, total: 1 })}
          />
        ))}
      </ScrollView>
      {orderItems.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(200)}
          style={[
            atoms.absolute,
            atoms.rounded_md,
            atoms.px_md,
            atoms.py_md,
            atoms.flex_row,
            atoms.justify_between,
            {
              bottom: insets.bottom + 80,
              // width: "90%",
              backgroundColor: t.palette.primary_500,
              left: 30,
              right: 30,
            },
          ]}
        >
          <View style={[atoms.flex_row, atoms.gap_xs]}>
            <Text
              style={[t.atoms.text_inverted, atoms.text_lg, atoms.font_bold]}
            >
              <Trans>Basket</Trans>
            </Text>
            <Text style={[t.atoms.text_inverted, atoms.text_lg]}>•</Text>
            <Text style={[t.atoms.text_inverted, atoms.text_lg]}>
              {`${basketLabel.items} `}
              <Trans>Items</Trans>
            </Text>
          </View>
          <View>
            <Text
              style={[t.atoms.text_inverted, atoms.text_lg, atoms.font_bold]}
            >
              {`${basketLabel.price}`}đ
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
type FoodItemProps = {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  total?: number;
  onAddItem: (id: number) => void;
  onRemoveItem: (id: number) => void;
};
function FoodItem({ item, onAddItem, total, onRemoveItem }: FoodItemProps) {
  const { _ } = useLingui();
  const t = useTheme();
  return (
    <View style={[]}>
      <View>
        <Image
          source={{ uri: item.image }}
          style={[atoms.rounded_md, { aspectRatio: 1, width: 170 }]}
          contentFit="cover"
        />
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={LinearTransition}
          style={[
            atoms.absolute,
            atoms.flex_row,
            atoms.rounded_full,
            atoms.border,
            {
              borderColor: t.palette.primary_500,
              backgroundColor: "#fff",
              bottom: 5,
              right: 5,
            },
          ]}
        >
          {total && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition}
              style={[atoms.flex_row]}
            >
              <TouchableOpacity
                onPress={() => onRemoveItem(item.id)}
                style={[
                  atoms.justify_center,
                  atoms.align_center,
                  {
                    width: 30,
                    height: 30,
                  },
                ]}
              >
                <Subtract />
              </TouchableOpacity>
              <View
                style={[
                  atoms.align_center,
                  atoms.justify_center,
                  { width: 25 },
                ]}
              >
                <Text style={[atoms.text_xl]}>{total}</Text>
              </View>
            </Animated.View>
          )}
          <Animated.View layout={LinearTransition}>
            <TouchableOpacity
              onPress={() => onAddItem(item.id)}
              style={[
                atoms.justify_center,
                atoms.align_center,
                {
                  width: 30,
                  height: 30,
                },
              ]}
            >
              <Plus size="sm" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
      <Text>{item.name}</Text>
      <Text style={[atoms.font_bold]}>{item.price}đ</Text>
    </View>
  );
}
const FOOD_ITEMS = [
  {
    id: 1,
    name: "Ô Long Nhài Sữa",
    price: 10000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
  {
    id: 2,
    name: "Ô Long Nhài Sữa 2",
    price: 20000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
  {
    id: 3,
    name: "Ô Long Nhài Sữa 3",
    price: 10000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
  {
    id: 4,
    name: "Ô Long Nhài Sữa 4",
    price: 10000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
  {
    id: 5,
    name: "Ô Long Nhài Sữa 5",
    price: 10000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
  {
    id: 6,
    name: "Ô Long Nhài Sữa 6",
    price: 102000,
    image:
      "https://mms.img.susercontent.com/vn-11134517-7r98o-lr4jda3150w4d9@resize_ss400x400!@crop_w400_h400_cT",
  },
];
