import {
  CommonNavigatorParams,
  HomeTabNavigatorParams,
  NativeStackScreenProps,
} from "@/lib/routes/types";
import NotificationListener from "../../../modules/notification-listener";
import * as Layout from "@/components/Layout";
import { Trans } from "@lingui/react/macro";
import { ScrollView } from "@/view/com/util/Views";
import { atoms, useTheme } from "@/alf";
import { TextInput, View } from "react-native";
import { Image } from "expo-image";
import { P, Text } from "@/components/Typography";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "@discord/bottom-sheet";
import { Button, ButtonIcon, ButtonText } from "@/components/Button";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "@/components/icons/Plus";
import { SubtractIcon as Subtract } from "@/components/icons/Subtract";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import * as Speech from "expo-speech";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { List } from "@/view/com/util/List";
export interface NotificationData {
  packageName: string;
  postTime: number;
  key: string;
  id: number;
  tag: string | null;
  groupKey: string | null;
  overrideGroupKey: string | null;
  userId: number;
  isOngoing: boolean;
  isClearable: boolean;
  title: string | null;
  text: string | null;
  subText: string | null;
  summaryText: string | null;
  infoText: string | null;
  bigText: string | null;
  when: number;
  number: number;
  flags: number;
  priority: number;
  category: string | null;
  channelId: string;
  tickerText: string | null;
  contentIntent: boolean;
  deleteIntent: boolean;
  fullScreenIntent: boolean;
  actionCount: number;
  sender: string | null;
  messages: number | null;
  isGroupSummary: boolean;
}
type Props = NativeStackScreenProps<HomeTabNavigatorParams, "Home">;
export function HomeScreen({}: Props) {
  const speakNumber = async (num: number) => {
    const text = numberToVietnamese(num);
    await Speech.speak(text, {
      language: "vi",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const speakCurrency = async (amount: number) => {
    const text = currencyToVietnamese(amount);
    await Speech.speak(`Đã nhận được ${text}`, {
      language: "vi",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const speakTime = async (date: Date) => {
    const text = timeToVietnamese(date.getHours(), date.getMinutes());
    await Speech.speak(text, {
      language: "vi",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const speakDate = async (date: Date) => {
    const text = dateToVietnamese(date);
    await Speech.speak(text, {
      language: "vi",
      pitch: 1.0,
      rate: 0.9,
    });
  };
  const [listNotification, setListNofification] = useState<NotificationData[]>(
    []
  );
  useEffect(() => {
    // Check notification permission when component mounts
    async function checkNotificationPermission() {
      const isEnabled =
        await NotificationListener.isNotificationServiceEnabled();
      if (!isEnabled) {
        // If not enabled, open settings
        await NotificationListener.openNotificationSettings();
      } else {
        // If enabled, start listening
        await NotificationListener.startListening();
      }
    }
    checkNotificationPermission();

    // Set up notification listener
    const subscription = NotificationListener.addListener(
      "onNotificationReceived",
      (event) => {
        console.log("Received notification:", event.notification);
        try {
          if (event?.notification) {
            const notificationObj = JSON.parse(
              event.notification
            ) as NotificationData;
            setListNofification((prev) => [...prev, notificationObj]);
          }
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
  const [text, setText] = useState("500000");
  const { _ } = useLingui();
  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Home</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
      </Layout.Header.Outer>

      <List
        data={listNotification}
        style={[atoms.flex_1, {}]}
        ItemSeparatorComponent={() => (
          <View style={[atoms.border_b, atoms.my_md]} />
        )}
        ListEmptyComponent={
          <View
            style={[atoms.flex_1, atoms.align_center, atoms.justify_center]}
          >
            <Text style={[atoms.text_xl]}>Gửi thông báo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[atoms.flex_1, atoms.gap_md]}>
            <Text style={[]}>title: {item.title}</Text>
            <Text style={[]}>text: {item.text}</Text>
            <Text style={[]}>subText: {item.subText}</Text>
            <Text style={[]}>packageName: {item.packageName}</Text>
          </View>
        )}
      />
      <TextInput
        defaultValue={text}
        onChangeText={setText}
        style={[
          atoms.border,
          atoms.text_md,
          atoms.py_md,
          atoms.px_md,
          atoms.rounded_md,
          atoms.m_md,
        ]}
      />

      <Button
        onPress={() => {
          speakCurrency(text);
        }}
        accessibilityHint={_(msg`Serve all`)}
        accessibilityLabel={_(msg`Serve all`)}
        variant="solid"
        color="primary"
        label={_(msg`Serve all`)}
        size="large"
      >
        <ButtonText>
          <Trans>Speak</Trans>
        </ButtonText>
      </Button>
    </Layout.Screen>
  );
}
const units = [
  "",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];
const positions = ["", "mươi", "trăm", "nghìn", "triệu", "tỷ"];

function readThreeDigits(num: number): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;

  let result = "";

  // Handle hundreds
  if (hundreds > 0) {
    result += `${units[hundreds]} ${positions[2]} `;
  }

  // Handle tens
  if (tens > 0) {
    if (tens === 1) {
      result += "mười ";
    } else {
      result += `${units[tens]} ${positions[1]} `;
    }
  }

  // Handle ones
  if (ones > 0) {
    if (tens === 0 && hundreds > 0) {
      result += "lẻ ";
    }
    if (ones === 1 && tens > 1) {
      result += "mốt ";
    } else if (ones === 5 && tens > 0) {
      result += "lăm ";
    } else {
      result += `${units[ones]} `;
    }
  }

  return result;
}

export function numberToVietnamese(num: number): string {
  if (num === 0) return "không";
  if (num < 0) return "âm " + numberToVietnamese(Math.abs(num));

  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  let result = "";

  if (billions > 0) {
    result += readThreeDigits(billions) + positions[5] + " ";
  }

  if (millions > 0) {
    result += readThreeDigits(millions) + positions[4] + " ";
  }

  if (thousands > 0) {
    result += readThreeDigits(thousands) + positions[3] + " ";
  }

  if (remainder > 0) {
    result += readThreeDigits(remainder);
  }

  return result.trim();
}

// Function to format currency
export function currencyToVietnamese(amount: number): string {
  return `${numberToVietnamese(amount)} đồng`;
}

// Function to format time
export function timeToVietnamese(hours: number, minutes: number): string {
  return `${numberToVietnamese(hours)} giờ ${numberToVietnamese(minutes)} phút`;
}

// Function to format date
export function dateToVietnamese(date: Date): string {
  return `ngày ${numberToVietnamese(date.getDate())} tháng ${numberToVietnamese(
    date.getMonth() + 1
  )} năm ${numberToVietnamese(date.getFullYear())}`;
}
