import {
  CommonNavigatorParams,
  HomeTabNavigatorParams,
  NativeStackScreenProps,
} from "@/lib/routes/types";
import { formatDistanceToNow } from "date-fns";

import * as Layout from "@/components/Layout";
import { Trans } from "@lingui/react/macro";
import { ScrollView } from "@/view/com/util/Views";
import { atoms, useTheme } from "@/alf";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  Modal,
  Pressable,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Text as RNText,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/Typography";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Button, ButtonIcon, ButtonText } from "@/components/Button";
import { PlusLarge_Stroke2_Corner0_Rounded as Plus } from "@/components/icons/Plus";
import { SubtractIcon as Subtract } from "@/components/icons/Subtract";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import Animated, {
  CurvedTransition,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  SharedValue,
  StretchInY,
  StretchOutY,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React from "react";
import { Pager, PagerRef, RenderTabBarFnProps } from "@/view/com/pager/Pager";
import { HomeHeader } from "@/view/com/home/HomeHeader";
import { Divider } from "@/components/Divider";
import data from "./data.json";
import { All_Stroke2_Corner0_Rounded } from "@/components/icons/All";
import {
  FoodItem,
  FoodTicket as FoodTicketType,
  Ticket,
  TicketType,
} from "./com/Orders";
import { List } from "@/view/com/util/List";
import { Bell_Stroke2_Corner0_Rounded } from "@/components/icons/Bell";
import { useLanguagePrefs } from "@/state/preferences";
import { useDateFnsLocale } from "@/locale/i18nProvider";
import { Clock_Stroke2_Corner0_Rounded } from "@/components/icons/Clock";
import { HITSLOP_20, HITSLOP_30 } from "@/lib/constants";
import { Close_Stroke2_Corner0_Rounded } from "@/components/icons/Close";
import { FAB } from "@/view/com/util/fab/FAB";
import { Reload_Stroke2_Corner0_Rounded } from "@/components/icons/Reload";
import HeatingFoodIcon from "../../../assets/icons/heating-food-in-flat-pan-on-fire-svgrepo-com.svg";
import { DeleteBack_Stroke2_Corner0_Rounded } from "@/components/icons/DeleteBack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GroupedProductsByTable,
  GroupProduct,
  Product,
  ProductList,
  productService,
  useGetRealTimeProducts,
  useProducts,
} from "@/api/service";
import { useFontScale } from "@/state/preferences/font-scale";
import { fontSize } from "@/alf/tokens";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import ServeIcon from "../../../assets/icons/restaurant-waiter.svg";

type Props = NativeStackScreenProps<HomeTabNavigatorParams, "Home">;
export function HomeScreen({}: Props) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [sessions, setSessions] = React.useState({
    accessToken: undefined,
  });
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(
    sessions.accessToken
  );

  const { emit, socket } = useGetRealTimeProducts(sessions.accessToken);

  const { mutate: chooseStoreMutate, isPending: isChoosingStore } = useMutation(
    {
      mutationFn: ({ token, storeId }: { token: string; storeId: string }) =>
        productService.chooseStore({
          verifyToken: token,
          storeId,
        }),
      onSuccess: (data) => {
        if (data && data.accessToken) {
          setSessions({ accessToken: data.accessToken });
        }
      },
    }
  );
  // const { mutate: getRequestProduct, isPending: isGettingRequestProduct } =
  //   useMutation({
  //     mutationKey: ["requestProduct"],
  //     mutationFn: (token: string) =>
  //       productService.requestProduct({
  //         verifyToken: token,
  //       }),
  //     onSuccess: (data) => {
  //       setProducts(data.data);
  //     },
  //   });
  const { mutate: loginMutation, isPending: isLoggingin } = useMutation({
    mutationKey: ["login"],
    mutationFn: () =>
      productService.login({
        username: "example8386",
        password: "MatKhau@123",
      }),
    onSuccess: (data) => {
      if (data.verifyToken && data.userStores[1]?.storeId) {
        chooseStoreMutate({
          token: data.verifyToken,
          storeId: data.userStores[1]?.storeId,
        });
      }
    },
    onError: (e) => {
      console.log(e, "error");
    },
  });

  useEffect(() => {
    loginMutation();
  }, []);
  const pagerRef = React.useRef<PagerRef>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const renderTabBar = React.useCallback((props: RenderTabBarFnProps) => {
    return (
      <HomeHeader
        key="FEEDS_TAB_BAR"
        {...props}
        testID="homeScreenFeedTabs"
        onPressSelected={() => {}}
      />
    );
  }, []);

  return (
    <Pager
      key={"homeScreenPager"}
      ref={pagerRef}
      testID="homeScreen"
      initialPage={selectedIndex}
      scrollEnabled={false}
      onPageSelected={(index) => setSelectedIndex(index)}
      // onPageScrollStateChanged={onPageScrollStateChanged}
      renderTabBar={renderTabBar}
    >
      <View key="1" style={[atoms.flex_1]}>
        <Tickets
          products={productsData?.data || []}
          accessToken={sessions.accessToken}
        />
      </View>
      <View key="2" style={[atoms.flex_1]}>
        <FoodTicket
          ticket={data}
          emit={emit}
          products={productsData?.data || []}
          accessToken={sessions.accessToken}
        />
      </View>
    </Pager>
  );
}

export function FoodTicket({
  ticket,
  products,
  emit,
  accessToken,
}: {
  ticket: Ticket[];
  products: Product[];
  emit: (event: string, data: any) => void;
  accessToken: string;
}) {
  console.log(products, "products");
  const { _ } = useLingui();
  const t = useTheme();
  const foodTickets = useMemo(() => {
    const foodItemMap = new Map<string, FoodTicketType>();

    ticket.forEach((ticketItem) => {
      ticketItem.foodItem.forEach((foodItem) => {
        // Create a unique key for each distinct food item
        const foodKey = `${foodItem.id}-${foodItem.name}`;

        if (foodItemMap.has(foodKey)) {
          // If this food item already exists, update its quantities and add the ticket reference
          const existingFoodTicket = foodItemMap.get(foodKey)!;
          existingFoodTicket.quantities += foodItem.quantities;
          existingFoodTicket.tickets = [
            ...(existingFoodTicket.tickets || []),
            ticketItem,
          ];
        } else {
          // If this is a new food item, create a new FoodTicket
          foodItemMap.set(foodKey, {
            ...foodItem,
            tickets: [ticketItem], // Store an array of tickets instead of a single ticket
          });
        }
      });
    });

    return Array.from(foodItemMap.values());
  }, [ticket]);

  const fontScale = useFontScale();
  const foodTicketsWaitingForProcess = useMemo(() => {
    if (foodTickets.length === 0) {
      return [];
    }
    return foodTickets.filter((item) => item.status === "pending");
  }, [foodTickets]);
  const foodTicketsProcessing = useMemo(() => {
    if (foodTickets.length === 0) {
      return [];
    }
    return foodTickets.filter((item) => item.status === "progressing");
  }, [foodTickets]);
  const groupedProductsData = useMemo(() => {
    if (!products.length) return [];

    const groupedMap = products.reduce((acc, product) => {
      if (!acc.has(product.productId)) {
        acc.set(product.productId, {
          productId: product.productId,
          productName: product.productName,
          totalQuantity: 0,
          items: new Map<
            string,
            {
              // Map to group items by note
              note: string | null;
              quantity: number;
              products: Product[];
            }
          >(),
        });
      }

      const group = acc.get(product.productId);
      group.totalQuantity += product.quantity;

      // Group items by note
      const noteKey = product.note || "no-note";
      if (!group.items.has(noteKey)) {
        group.items.set(noteKey, {
          note: product.note,
          quantity: 0,
          products: [],
        });
      }

      const noteGroup = group.items.get(noteKey)!;
      noteGroup.quantity += product.quantity;
      noteGroup.products.push(product);

      return acc;
    }, new Map());
    // Convert Map to array and transform the items Map to array
    return Array.from(groupedMap.values()).map((group) => ({
      ...group,
      items: Array.from(group.items.values()),
    }));
  }, [products]);
  const renderWaitingForPrecessFood = (enableRowActions = true) => {
    return (
      <List
        layout={LinearTransition.duration(300)}
        itemLayoutAnimation={LinearTransition.duration(300)}
        data={groupedProductsData}
        keyExtractor={(item) => `${item.productId}`}
        contentContainerStyle={[
          atoms.pb_5xl,
          atoms.px_md,
          atoms.pt_lg,
          atoms.flex_grow,
        ]}
        ItemSeparatorComponent={() => <View style={[atoms.mt_md]} />}
        renderItem={({ item: foodItem, index }) => (
          <FoodTicketItem
            item={foodItem}
            index={index}
            enableRowActions={enableRowActions}
            emit={emit}
            accessToken={accessToken}
          />
        )}
      />
    );
  };
  const renderProcessingFood = (enableRowActions = true) => {
    return (
      <List
        layout={LinearTransition.duration(300)}
        itemLayoutAnimation={LinearTransition.duration(300)}
        // CellRendererComponent={<Animated.View></Animated.View>}
        data={foodTicketsProcessing}
        keyExtractor={(item) => item.productId + fontSize}
        contentContainerStyle={[atoms.pb_5xl, atoms.px_md, atoms.pt_lg]}
        ItemSeparatorComponent={() => <View style={[atoms.mt_md]} />}
        renderItem={({ item: foodItem }) => (
          <FoodTicketItem item={foodItem} enableRowActions={enableRowActions} />
        )}
      />
    );
  };

  return (
    <View style={[atoms.flex_1, { backgroundColor: "#E7EAFE" }]}>
      {/* <View
        style={[
          atoms.flex_row,
          { width: "100%", height: 60, backgroundColor: "#fff" },
        ]}
      >
        <View style={[atoms.flex_1, atoms.justify_center]}>
          <Text style={[atoms.text_lg, atoms.ml_lg]}>
            <Trans>Waiting to process</Trans>
          </Text>
        </View>
        <View
          style={[atoms.border_r, atoms.my_md, t.atoms.border_contrast_high]}
        />
        <View style={[atoms.flex_1, atoms.justify_center]}>
          <Text style={[atoms.text_lg, atoms.ml_lg]}>
            <Trans>In processing</Trans>
          </Text>
        </View>
      </View> */}
      <View style={[atoms.flex_1, atoms.flex_row]}>
        <View style={[atoms.flex_1]}>{renderWaitingForPrecessFood()}</View>
        {/* <View
          style={[
            {
              height: "100%",
              width: 20,
              backgroundColor: "#fff",
            },
          ]}
        />
        <View style={[atoms.flex_1]}>{renderProcessingFood()}</View> */}
      </View>
      {/* <ServeQuantityModal visible={true} /> */}
    </View>
  );
}

const FoodTicketItem = ({
  item: foodItem,
  enableRowActions = false,
  index: foodTicketIndex,
  emit,
  accessToken,
}: {
  item: GroupProduct;
  enableRowActions?: boolean;
  index: number;
  emit: (event: string, data: any) => void;
  accessToken: string;
}) => {
  const t = useTheme();
  const { _ } = useLingui();
  const [isExpanded, setIsExpanded] = React.useReducer((prev) => !prev, true);

  const isExpandedShareValue = useSharedValue(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: isExpandedShareValue.get() ? "flex" : "none",
    };
  });
  const fontScale = useFontScale();
  const renderActionsButton = () => {
    if (foodItem.status === "PENDING") {
      return (
        <View style={[atoms.gap_md, atoms.flex_row]}>
          <Button
            label={_(msg`Go back`)}
            size="small"
            variant="solid"
            color="negative"
            shape="square"
            onPress={() => {}}
          >
            <ButtonIcon icon={Close_Stroke2_Corner0_Rounded} size="xl" />
          </Button>
          <Button
            label={_(msg`Go back`)}
            size="small"
            variant="solid"
            color="primary"
            shape="square"
            onPress={() => {}}
          >
            <ButtonIcon icon={HeatingFoodIcon} size="xl" />
          </Button>
        </View>
      );
    } else if (foodItem.status === "progressing") {
      return (
        <View style={[atoms.gap_xl, atoms.flex_row]}>
          <Button
            label={_(msg`Go back`)}
            size="small"
            variant="solid"
            color="negative"
            shape="square"
            onPress={() => {}}
          >
            <ButtonIcon icon={Close_Stroke2_Corner0_Rounded} size="xl" />
          </Button>
          <Button
            label={_(msg`Go back`)}
            size="small"
            variant="solid"
            color="secondary"
            shape="square"
            onPress={() => {}}
          >
            <ButtonIcon icon={Bell_Stroke2_Corner0_Rounded} size="xl" />
          </Button>
          <Button
            label={_(msg`Go back`)}
            size="small"
            variant="solid"
            color="primary"
            shape="square"
            onPress={() => {}}
          >
            <ButtonIcon icon={Bell_Stroke2_Corner0_Rounded} size="xl" />
          </Button>
        </View>
      );
    }
  };
  const QUANTITY_BOX_SIZE = 45;

  const handleServeProduct = (product: Product) => {
    emit("request.request-confirm-order", {
      productId: "heyyyy",
    });
  };

  function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 100 }],
      };
    });

    return (
      <Animated.View
        style={[atoms.align_center, atoms.justify_center, styleAnimation]}
      >
        <Text
          style={[
            {
              height: "100%",
              backgroundColor: "red",
              width: 100,
              textAlign: "center",
              textAlignVertical: "center",
            },
          ]}
        >
          <Trans>Serve</Trans>
        </Text>
      </Animated.View>
    );
  }
  const [selectedProduct, setSelectedProduct] = useState<
    | {
        note: string | null;
        quantity: number;
        products: Product[];
      }
    | undefined
  >(undefined);
  const queryClient = useQueryClient();

  const { mutate: updateProductStatus } = useMutation({
    mutationKey: ["updateProductsStatus"],
    mutationFn: ({
      productIds,
      status,
    }: {
      productIds: string[];
      status: string;
    }) =>
      productService.updateProductsStatus({
        productIds,
        status: "COMPLETED",
        accessToken: accessToken,
      }),
    onSuccess: (data) => {
      if (data && data.status === "success") {
        // Toast.show("Đã thực hiện", "success");
      }
    },
    onError: (e) => {
      console.log(e, "error");
    },
  });

  const handleRemoveProduct = (products: Product[]) => {
    updateProductStatus({
      productIds: products.map((product) => product.id),
      status: "COMPLETED",
      accessToken: accessToken,
    });
    queryClient.setQueryData<ProductList>(["requestProduct"], (old) => {
      if (!old) return old;
      const newProducts = old.data.filter(
        (product) => !products.find((p) => p.id === product.id)
      );
      return {
        ...old,
        data: newProducts,
      };
    });
  };

  const renderProductDetail = useMemo(() => {
    return foodItem.items.map((product, productIndex) => {
      const isLast = productIndex === foodItem.items.length - 1;
      return (
        <View key={`${product.note}-${productIndex}`} style={[atoms.flex_1]}>
          <Swipeable
            enabled={false}
            containerStyle={[atoms.flex_1]}
            friction={2}
            enableTrackpadTwoFingerGesture
            rightThreshold={40}
            renderRightActions={RightAction}
          >
            <View
              style={[
                atoms.flex_row,
                atoms.align_center,
                atoms.justify_center,
                atoms.gap_md,
              ]}
            >
              <View
                style={[
                  !isLast && {
                    borderBottomWidth: 2,
                  },
                  {
                    borderStyle: "dashed",
                    paddingLeft:
                      QUANTITY_BOX_SIZE *
                        fontScale *
                        (fontScale > 2 ? 0.3 : 1) +
                      24,
                  },
                  t.atoms.border_contrast_high,
                  atoms.flex_1,
                  atoms.flex_row,
                  atoms.justify_between,
                  atoms.align_center,
                  atoms.py_xl,
                ]}
              >
                <View style={[atoms.gap_md, atoms.flex_1]}>
                  <Text
                    style={[
                      {
                        fontSize:
                          atoms.text_md.fontSize *
                          fontScale *
                          (fontScale > 2 ? 0.4 : 1),
                      },
                    ]}
                  >
                    - {foodItem.productName}
                  </Text>

                  {product.note && (
                    <RNText
                      style={[
                        atoms.italic,
                        atoms.ml_lg,
                        {
                          color: t.palette.primary_500,
                          fontSize:
                            atoms.text_sm.fontSize *
                            fontScale *
                            (fontScale > 2 ? 0.4 : 1),
                          flexWrap: "wrap",
                          flexShrink: 1,
                          maxWidth: "65%",
                          overflow: "hidden",
                        },
                      ]}
                    >
                      {product.note}
                    </RNText>
                  )}
                </View>
                <View
                  style={[atoms.gap_md, atoms.flex_row, atoms.align_center]}
                >
                  <Text
                    style={[
                      {
                        fontSize:
                          atoms.text_md.fontSize *
                          fontScale *
                          (fontScale > 2 ? 0.3 : 1),
                      },
                    ]}
                  >
                    <Trans>Qty</Trans>: {product.quantity}
                  </Text>
                  <Button
                    label={_(msg`Go back`)}
                    size="large"
                    variant="solid"
                    color="primary"
                    shape="square"
                    onPress={() => {
                      handleRemoveProduct(product.products);
                    }}
                  >
                    {/* <ServeIcon /> */}
                    <ButtonIcon icon={ServeIcon} size="xl" />
                  </Button>
                  {product.quantity > 1 && (
                    <Button
                      label={_(msg`Go back`)}
                      size="large"
                      variant="solid"
                      color="secondary"
                      shape="square"
                      onPress={() => {
                        setSelectedProduct(product);
                      }}
                    >
                      <ButtonIcon icon={ServeIcon} size="xl" />
                    </Button>
                  )}
                  <Button
                    label={_(msg`Go back`)}
                    size="large"
                    variant="solid"
                    color="negative"
                    shape="square"
                    onPress={() => {
                      Alert.alert(
                        "Huỷ yêu cầu",
                        "Bạn có muốn huỷ yêu cầu này?",
                        [
                          {
                            text: "Huỷ",
                            onPress: () => {},
                            style: "cancel",
                          },
                          {
                            text: "Đồng ý",
                            onPress: () =>
                              handleRemoveProduct(product.products),
                          },
                        ]
                      );
                    }}
                  >
                    <ButtonIcon
                      icon={Close_Stroke2_Corner0_Rounded}
                      size="2xl"
                    />
                  </Button>
                </View>
              </View>
            </View>
          </Swipeable>
        </View>
      );
    });
  }, [foodItem, fontScale]);
  const totalQuantity = foodItem.totalQuantity;
  return (
    <View
      key={foodItem.productId}
      style={[
        atoms.gap_md,
        atoms.p_md,
        atoms.rounded_md,
        atoms.flex_1,
        { backgroundColor: "#fff" },
      ]}
    >
      <View
        style={[
          atoms.flex_row,
          atoms.gap_lg,
          atoms.justify_between,
          atoms.z_10,
          atoms.flex_1,
        ]}
      >
        <TouchableOpacity
          style={[
            atoms.flex_row,
            atoms.gap_md,
            atoms.rounded_full,
            atoms.pr_sm,
            {
              width: "100%",
            },
            atoms.align_center,
          ]}
          onPress={() => {
            isExpandedShareValue.value = !isExpandedShareValue.value;
          }}
        >
          <View
            style={[
              [
                atoms.align_center,
                atoms.justify_center,
                atoms.rounded_xs,
                {
                  width:
                    QUANTITY_BOX_SIZE * fontScale * (fontScale > 2 ? 0.3 : 1),
                  height:
                    QUANTITY_BOX_SIZE * fontScale * (fontScale > 2 ? 0.3 : 1),
                  backgroundColor: "#D9EDFE",
                },
              ],
            ]}
          >
            <Text
              style={[
                atoms.text_md,
                {
                  fontSize:
                    atoms.text_md.fontSize *
                    fontScale *
                    (fontScale > 2 ? 0.4 : 1),
                },
              ]}
            >
              {foodTicketIndex + 1}
            </Text>
          </View>
          <View
            style={[
              atoms.flex_row,
              atoms.flex_1,
              atoms.flex_wrap,
              atoms.align_center,
              atoms.gap_md,
              atoms.justify_between,
            ]}
          >
            <Text
              numberOfLines={2}
              style={[
                atoms.font_bold,
                atoms.text_lg,
                {
                  fontSize: atoms.text_lg.fontSize * fontScale,
                },
              ]}
            >
              {foodItem.productName}
            </Text>
            <View style={[atoms.flex_row, atoms.align_center, atoms.gap_md]}>
              <Text
                style={[
                  atoms.font_bold,
                  atoms.text_lg,
                  {
                    fontSize:
                      atoms.text_lg.fontSize *
                      fontScale *
                      (fontScale > 2 ? 0.3 : 1),
                  },
                ]}
              >
                <Trans>Qty</Trans>:{` ${totalQuantity}`}
              </Text>
              <Button
                onPress={() => {
                  const allProducts = foodItem.items.reduce<Product[]>(
                    (acc, item) => {
                      return [...acc, ...item.products];
                    },
                    []
                  );
                  handleRemoveProduct(allProducts);
                }}
                accessibilityHint={_(msg`Serve all`)}
                accessibilityLabel={_(msg`Serve all`)}
                variant="solid"
                color="primary"
                label={_(msg`Serve all`)}
                size="large"
              >
                <ButtonText>
                  <Trans>Serve all</Trans>
                </ButtonText>
              </Button>
            </View>
          </View>
        </TouchableOpacity>

        {enableRowActions && renderActionsButton()}
      </View>
      {isExpanded && <Divider />}
      <Animated.View
        style={[atoms.gap_md, atoms.z_10, atoms.flex_1, animatedStyle]}
      >
        {renderProductDetail}

        {/* <View
          style={[
            [
              atoms.border,
              atoms.align_center,
              atoms.justify_center,
              atoms.rounded_md,
              t.atoms.border_contrast_high,
              {
                width: 35 * fontScale * (fontScale > 2 ? 0.3 : 1),
                height: 35 * fontScale * (fontScale > 2 ? 0.3 : 1),
              },
            ],
          ]}
        >
          <Text
            style={[
              {
                fontSize:
                  atoms.text_md.fontSize *
                  fontScale *
                  (fontScale > 2 ? 0.4 : 1),
              },
            ]}
          >
            {foodItem.totalQuantity}
          </Text>
        </View>
        <View>
          <View style={[{ height: 35 }, atoms.justify_center]}></View>
          <Text style={[atoms.text_md]}>
            <Trans>Qty</Trans>: {foodItem.quantities}{" "}
            {foodItem.unitType === "glass" ? _(msg`Glass`) : _(msg`Piece`)}
          </Text>
        </View> */}
      </Animated.View>
      <ServeQuantityModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(undefined)}
      />
    </View>
  );
};

export function Tickets({
  products,
  accessToken,
}: {
  products: Product[];
  accessToken: string;
}) {
  const { _ } = useLingui();
  const t = useTheme();
  const [selectedTicketType, setSelectedTicketType] =
    React.useState<TicketType>("all");
  const LIST_ITEMS = [
    { id: 1, type: "all", label: _(msg`All`) },
    { id: 2, type: "dine-in", label: _(msg`Dine in`) },
    { id: 3, type: "take-away", label: _(msg`Takeaway`) },
    { id: 4, type: "shipping", label: _(msg`Shipping`) },
    { id: 5, type: "partner", label: _(msg`Partner`) },
  ];

  const groupedProductsByTableData = React.useMemo(() => {
    if (!products.length) return [];

    // First, group by request.id
    const groupedByRequest = products.reduce((requestAcc, product) => {
      const requestId = product.request.id;
      const tableName = product.request.table.name;
      const zoneName = product.request.table.zone.name;

      if (!requestAcc.has(requestId)) {
        requestAcc.set(requestId, {
          requestId,
          tableName,
          zoneName,
          createdAt: product.createdAt, // Adding createdAt for sorting if needed
          products: new Map<string, GroupProduct>(),
        });
      }

      const requestGroup = requestAcc.get(requestId);

      // Then group by productId within each request
      if (!requestGroup.products.has(product.productId)) {
        requestGroup.products.set(product.productId, {
          productId: product.productId,
          productName: product.productName,
          totalQuantity: 0,
          items: new Map<
            string,
            {
              note: string | null;
              quantity: number;
              products: Product[];
            }
          >(),
        });
      }

      const productGroup = requestGroup.products.get(product.productId);
      productGroup.totalQuantity += product.quantity;

      // Group items by note within each product
      const noteKey = product.note || "no-note";
      if (!productGroup.items.has(noteKey)) {
        productGroup.items.set(noteKey, {
          note: product.note,
          quantity: 0,
          products: [],
        });
      }

      const noteGroup = productGroup.items.get(noteKey);
      noteGroup.quantity += product.quantity;
      noteGroup.products.push(product);

      return requestAcc;
    }, new Map());

    // Convert the nested Maps to arrays for easier rendering
    return Array.from(groupedByRequest.values()).map((requestGroup) => ({
      ...requestGroup,
      products: Array.from(requestGroup.products.values()).map(
        (productGroup) => ({
          ...productGroup,
          items: Array.from(productGroup.items.values()),
        })
      ),
    }));
  }, [products]);
  console.log(groupedProductsByTableData, "groupedProductsByTableData");
  const filteredData = React.useMemo(() => {
    if (selectedTicketType === "all") {
      return data;
    }
    return data.filter((item) => item.type === selectedTicketType);
  }, [selectedTicketType]);
  async function getScreenOrientation() {
    return await ScreenOrientation.getOrientationAsync();
  }

  async function changeScreenOrientation() {
    const orientation = await getScreenOrientation();

    await ScreenOrientation.lockAsync(
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP
        ? ScreenOrientation.OrientationLock.LANDSCAPE
        : ScreenOrientation.OrientationLock.PORTRAIT
    );
    setAppOrientation(
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP
        ? ScreenOrientation.Orientation.LANDSCAPE_LEFT
        : ScreenOrientation.Orientation.PORTRAIT_UP
    );
  }
  const SIDE_BAR_SIZE = 140;
  return (
    <View style={[atoms.flex_1, atoms.flex_row]}>
      {/* <View
        style={[
          {
            height: "100%",
            width: SIDE_BAR_SIZE,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          style={[
            {
              height: "100%",
              width: SIDE_BAR_SIZE,
            },
          ]}
        >
          {LIST_ITEMS.map((item, index) => {
            const isLast = index === LIST_ITEMS.length - 1;

            return (
              <View key={item.id}>
                <View
                  style={[
                    atoms.align_center,
                    atoms.justify_center,
                    {
                      width: SIDE_BAR_SIZE,
                      height: SIDE_BAR_SIZE,
                      backgroundColor: "#E7EAFE",
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      setSelectedTicketType(item.type as TicketType)
                    }
                    style={[
                      [
                        atoms.align_center,
                        atoms.justify_center,
                        {
                          width: SIDE_BAR_SIZE,
                          height: SIDE_BAR_SIZE,
                          backgroundColor: "#fff",
                        },
                        selectedTicketType === item.type && [
                          atoms.rounded_md,
                          {
                            width: 100,
                            height: 100,
                          },
                        ],
                      ],
                    ]}
                  >
                    <All_Stroke2_Corner0_Rounded />
                    <Text style={[atoms.text_lg]}>{item.label}</Text>
                  </Pressable>
                </View>
                {!isLast && <Divider />}
              </View>
            );
          })}
        </ScrollView>
      </View> */}
      <View style={[atoms.flex_1, { backgroundColor: "#E7EAFE" }]}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={[
            atoms.flex_wrap,
            atoms.flex_row,
            atoms.gap_md,
            atoms.justify_start,
            atoms.align_start,
            atoms.px_md,
            {
              paddingTop: 30,
              paddingBottom: 100,
            },
          ]}
        >
          {groupedProductsByTableData.map(
            (item: GroupedProductsByTable, index) => (
              <TicketItem
                item={item}
                totalItems={filteredData.length}
                index={index}
                key={item.tableId}
                accessToken={accessToken}
              />
            )
          )}
        </ScrollView>
        <View style={[atoms.absolute]}></View>
      </View>
    </View>
  );
}

export function TicketItem({
  item,
  index,
  totalItems,
  accessToken,
}: {
  item: GroupedProductsByTable;
  index: number;
  totalItems: number;
  accessToken: string;
}) {
  const { _ } = useLingui();
  const t = useTheme();
  const dateFnsLocale = useDateFnsLocale();
  const langPrefs = useLanguagePrefs();

  const [ticketSumaryModalVisibility, setTicketSumaryModalVisibility] =
    React.useState(false);
  const timeAgo = React.useMemo(() => {
    const createdAt = item.products[0]?.items[0]?.products[0]?.createdAt;
    //item.createdAt
    return formatDistanceToNow(createdAt ? new Date(createdAt) : new Date(), {
      addSuffix: true,
      locale: dateFnsLocale,
    });
  }, [item.products, dateFnsLocale]);
  const renderTicketFooter = (enableRowActions = false) => {
    return (
      <List
        layout={LinearTransition.duration(300)}
        itemLayoutAnimation={LinearTransition.duration(300)}
        // CellRendererComponent={<Animated.View></Animated.View>}
        data={item.products}
        style={{ maxHeight: 400 }}
        ItemSeparatorComponent={() => (
          <Divider style={[{ borderTopWidth: 2 }]} />
        )}
        renderItem={({ item: foodItem, index }) => (
          <TickerFooterItem
            item={foodItem}
            enableRowActions={enableRowActions}
            foodTicketIndex={index}
            accessToken={accessToken}
          />
        )}
      />
    );
  };
  const renderTicketSumaryModal = useMemo(() => {
    return (
      <Modal
        visible={ticketSumaryModalVisibility}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTicketSumaryModalVisibility(false)}
        statusBarTranslucent={true}
      >
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[
            { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
            atoms.justify_center,
            atoms.align_center,
          ]}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setTicketSumaryModalVisibility(false);
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />
          </TouchableWithoutFeedback>
          {ticketSumaryModalVisibility && (
            <Animated.View
              entering={StretchInY.duration(200)}
              exiting={StretchOutY.duration(200)}
              layout={LinearTransition}
              style={[
                atoms.align_center,
                atoms.justify_center,
                atoms.px_md,
                atoms.py_md,
                atoms.rounded_md,
                atoms.gap_md,
                {
                  backgroundColor: "#fff",
                  width: "90%",
                },
              ]}
            >
              <View style={[atoms.py_sm]}>
                <Text style={[atoms.text_lg, atoms.font_bold]}>
                  <Trans>Ticket detail</Trans>
                </Text>
              </View>
              <Divider />

              <View
                style={[
                  atoms.px_md,
                  atoms.py_sm,
                  atoms.gap_md,
                  {
                    width: "100%",
                  },
                ]}
              >
                <View style={[atoms.flex_row, atoms.justify_between]}>
                  <View style={[atoms.gap_xs]}>
                    <Text style={[atoms.text_md]}>{item.name}</Text>
                    <View
                      style={[atoms.flex_row, atoms.align_center, atoms.gap_xs]}
                    >
                      <Clock_Stroke2_Corner0_Rounded />
                      <View style={[atoms.flex_wrap]}>
                        <Text
                          style={[atoms.text_sm, t.atoms.text_contrast_medium]}
                        >
                          {timeAgo}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[atoms.flex_row, atoms.gap_md]}>
                    <Button
                      onPress={() => {}}
                      accessibilityHint={_(msg`Won't do`)}
                      accessibilityLabel={_(msg`Won't do`)}
                      variant="outline"
                      color="negative"
                      label={_(msg`Won't do`)}
                      size="large"
                    >
                      <ButtonText>
                        <Trans>Won't do</Trans>
                      </ButtonText>
                    </Button>
                    <Button
                      onPress={() => {}}
                      accessibilityHint={_(msg`Serve all`)}
                      accessibilityLabel={_(msg`Serve all`)}
                      variant="solid"
                      color="primary"
                      label={_(msg`Serve all`)}
                      size="large"
                    >
                      <ButtonText>
                        <Trans>Serve all</Trans>
                      </ButtonText>
                    </Button>
                  </View>
                </View>
                {renderTicketFooter(true)}
              </View>
              <Divider />
              <View
                style={[
                  {
                    width: "100%",
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setTicketSumaryModalVisibility(false)}
                  style={[
                    atoms.align_center,
                    atoms.justify_center,
                    atoms.py_md,
                    {
                      height: 48,
                      width: "100%",
                    },
                  ]}
                >
                  <Text style={[atoms.text_lg, {}]}>
                    <Trans>Close</Trans>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </Modal>
    );
  }, [ticketSumaryModalVisibility]);
  return (
    <Animated.View
      entering={FadeInDown.duration(200).delay(index * 50)}
      exiting={FadeOutDown.duration(200).delay((totalItems - 1 - index) * 50)}
      layout={CurvedTransition.duration(500)}
      style={[
        atoms.rounded_md,
        {
          width: 380,
          backgroundColor: "#fff",
          overflow: "hidden",
        },
      ]}
    >
      <View
        style={[
          {
            width: "100%",
            height: 8,
            backgroundColor: t.palette.primary_500,
          },
        ]}
      />
      <TouchableOpacity
        style={[atoms.flex_row, atoms.align_start]}
        // onPress={() => setTicketSumaryModalVisibility(true)}
      >
        <View
          style={[
            atoms.mx_xs,
            // atoms.px_xs,
            atoms.pt_sm,
            atoms.align_center,
            atoms.gap_xs,
            { backgroundColor: t.palette.primary_500 },
          ]}
        >
          <Bell_Stroke2_Corner0_Rounded
            size="md"
            color={"#fff"}
            fill={"#fff"}
          />
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: "transparent",
              borderStyle: "solid",
              borderLeftWidth: 13,
              borderRightWidth: 13,
              borderBottomWidth: 7,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#fff",
            }}
          />
        </View>
        <View
          style={[
            atoms.flex_row,
            atoms.justify_between,
            atoms.align_center,
            atoms.px_md,
            atoms.py_sm,
            atoms.flex_1,
          ]}
        >
          <View style={[atoms.gap_xs]}>
            <Text
              style={[atoms.text_lg]}
            >{`Phiếu yêu cầu gọi món - ${item.tableName}`}</Text>
            <View style={[atoms.flex_row, atoms.align_center, atoms.gap_xs]}>
              <Clock_Stroke2_Corner0_Rounded />
              <View style={[atoms.flex_wrap]}>
                <Text style={[atoms.text_sm, t.atoms.text_contrast_medium]}>
                  {timeAgo}
                </Text>
              </View>
            </View>
          </View>
          {/* <Button
            onPress={() => {
              const allProducts = foodItem.items.reduce<Product[]>(
                (acc, item) => {
                  return [...acc, ...item.products];
                },
                []
              );
            }}
            accessibilityHint={_(msg`Serve all`)}
            accessibilityLabel={_(msg`Serve all`)}
            variant="solid"
            color="primary"
            label={_(msg`Serve all`)}
            size="large"
          >
            <ButtonText>
              <Trans>Serve all</Trans>
            </ButtonText>
          </Button> */}
        </View>
      </TouchableOpacity>
      <Divider />
      <View style={[atoms.px_md, atoms.py_sm]}>{renderTicketFooter()}</View>
      {/* {renderTicketSumaryModal} */}
    </Animated.View>
  );
}
const TickerFooterItem = ({
  item: foodItem,
  enableRowActions = false,
  foodTicketIndex,
  accessToken,
}: {
  item: GroupProduct;
  enableRowActions?: boolean;
  foodTicketIndex: number;
  accessToken: string;
}) => {
  const t = useTheme();
  const { _ } = useLingui();
  const fontScale = useFontScale();
  const [isExpanded, setIsExpanded] = React.useReducer((prev) => !prev, false);
  const isExpandedShareValue = useSharedValue(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: isExpandedShareValue.value ? "flex" : "none",
    };
  });

  const queryClient = useQueryClient();
  const { mutate: updateProductStatus } = useMutation({
    mutationKey: ["updateProductsStatus"],
    mutationFn: ({
      productIds,
      status,
    }: {
      productIds: string[];
      status: string;
    }) =>
      productService.updateProductsStatus({
        productIds,
        status: "COMPLETED",
        accessToken: accessToken,
      }),
    onSuccess: (data) => {
      if (data && data.status === "success") {
        // Toast.show("Đã thực hiện", "success");
      }
    },
    onError: (e) => {
      console.log(e, "error");
    },
  });

  const handleRemoveProduct = (products: Product[]) => {
    updateProductStatus({
      productIds: products.map((product) => product.id),
      status: "COMPLETED",
      accessToken: accessToken,
    });
    queryClient.setQueryData<ProductList>(["requestProduct"], (old) => {
      if (!old) return old;
      const newProducts = old.data.filter(
        (product) => !products.find((p) => p.id === product.id)
      );
      return {
        ...old,
        data: newProducts,
      };
    });
  };
  const QUANTITY_BOX_SIZE = 45;
  const renderProductDetail = useMemo(() => {
    return foodItem.items.map((product, productIndex) => {
      const isLast = productIndex === foodItem.items.length - 1;
      return (
        <View key={`${product.note}-${productIndex}`} style={[atoms.flex_1]}>
          <View
            style={[
              atoms.flex_row,
              atoms.align_center,
              atoms.justify_center,
              atoms.gap_md,
            ]}
          >
            <View
              style={[
                {},
                t.atoms.border_contrast_high,
                atoms.flex_1,
                atoms.flex_row,
                atoms.justify_between,
                atoms.align_center,
                atoms.py_xl,
              ]}
            >
              <View style={[atoms.gap_md, atoms.flex_1]}>
                <Text
                  style={[
                    {
                      fontSize: atoms.text_md.fontSize,
                    },
                  ]}
                >
                  - {foodItem.productName}
                </Text>

                {product.note && (
                  <RNText
                    style={[
                      atoms.italic,
                      atoms.ml_lg,
                      {
                        color: t.palette.primary_500,
                        fontSize: atoms.text_sm.fontSize,
                        flexWrap: "wrap",
                        flexShrink: 1,
                        maxWidth: "65%",
                        overflow: "hidden",
                      },
                    ]}
                  >
                    {product.note}
                  </RNText>
                )}
                <Text
                  style={[
                    {
                      fontSize: atoms.text_md.fontSize,
                    },
                  ]}
                >
                  <Trans>Qty</Trans>: {product.quantity}
                </Text>
              </View>
              <View style={[atoms.gap_md, atoms.flex_row, atoms.align_center]}>
                <Button
                  label={_(msg`Go back`)}
                  size="large"
                  variant="solid"
                  color="primary"
                  shape="square"
                  onPress={() => {
                    handleRemoveProduct(product.products);
                  }}
                >
                  <ButtonIcon icon={ServeIcon} size="xl" />
                </Button>
                {/* {product.quantity > 1 && (
                  <Button
                    label={_(msg`Go back`)}
                    size="large"
                    variant="solid"
                    color="secondary"
                    shape="square"
                    onPress={() => {
                      setSelectedProduct(product);
                    }}
                    hitSlop={HITSLOP_30}
                  >
                    <ButtonIcon icon={Bell_Stroke2_Corner0_Rounded} size="xl" />
                  </Button>
                )} */}
                <Button
                  label={_(msg`Go back`)}
                  size="large"
                  variant="solid"
                  color="negative"
                  shape="square"
                  onPress={() => {
                    Alert.alert("Huỷ yêu cầu", "Bạn có muốn huỷ yêu cầu này?", [
                      {
                        text: "Huỷ",
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: "Đồng ý",
                        onPress: () => handleRemoveProduct(product.products),
                      },
                    ]);
                  }}
                >
                  <ButtonIcon icon={Close_Stroke2_Corner0_Rounded} size="2xl" />
                </Button>
              </View>
            </View>
          </View>
        </View>
      );
    });
  }, [foodItem, fontScale]);
  return (
    <View style={[atoms.gap_md, atoms.py_md, atoms.flex_1]}>
      <TouchableOpacity
        style={[
          atoms.flex_row,
          atoms.gap_md,
          atoms.rounded_full,
          atoms.pr_sm,
          {
            width: "100%",
          },
          atoms.align_center,
        ]}
        onPress={() => {
          isExpandedShareValue.value = !isExpandedShareValue.value;
        }}
      >
        <View
          style={[
            [
              atoms.align_center,
              atoms.justify_center,
              atoms.rounded_xs,
              {
                width: QUANTITY_BOX_SIZE,
                height: QUANTITY_BOX_SIZE,
                backgroundColor: "#D9EDFE",
              },
            ],
          ]}
        >
          <Text style={[atoms.text_md]}>{foodTicketIndex + 1}</Text>
        </View>
        <View
          style={[
            atoms.flex_row,
            atoms.flex_1,
            atoms.flex_wrap,
            atoms.align_center,
            atoms.gap_md,
            atoms.justify_between,
          ]}
        >
          <Text numberOfLines={2} style={[atoms.font_bold, atoms.text_lg]}>
            {foodItem.productName}
          </Text>
          <View style={[atoms.flex_row, atoms.align_center, atoms.gap_md]}>
            <Text style={[atoms.font_bold, atoms.text_lg]}>
              <Trans>Qty</Trans>:{` ${foodItem.totalQuantity}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Animated.View>{renderProductDetail}</Animated.View>
    </View>
  );
};

export const ServeQuantityModal = ({
  visible,
  onClose,
  product,
}: {
  visible: boolean;
  onClose: () => void;
  product: {
    note: string | null;
    quantity: number;
    products: Product[];
  };
}) => {
  const t = useTheme();
  const { _ } = useLingui();

  const [quantity, setQuantity] = React.useState("0");

  useEffect(() => {
    if (!visible) {
      resetQuantity();
    }
  }, [visible]);

  const resetQuantity = () => {
    setQuantity("0");
  };
  const deleteQuantity = () => {
    if (quantity.length === 1) {
      resetQuantity();
      return;
    }
    setQuantity(quantity.slice(0, -1));
  };
  const addQuantity = (number: number) => {
    if (Number(quantity + number) > product.quantity) {
      return;
    }
    if (quantity === "0") {
      setQuantity(number.toString());
      return;
    }
    setQuantity(quantity + number);
  };
  const queryClient = useQueryClient();
  const handleServeProduct = () => {
    const enteredQuantity = Number(quantity);
  
    if (!product || !product.products || enteredQuantity <= 0) {
      onClose();
      return;
    }
  
    let remainingQuantityToRemove = enteredQuantity;
    const productsToRemove = []; // Array to track products to be removed (fully or partially)
    const productIdsToRemove = new Set(); // Set to track only unique product IDs
  
    // 1. Prioritize removing entire products
    for (const prod of product.products) {
      if (prod.quantity <= remainingQuantityToRemove) {
        productsToRemove.push(prod); // Remove the whole product
        remainingQuantityToRemove -= prod.quantity;
        productIdsToRemove.add(prod.id); // Add product ID to set
      }
      if (remainingQuantityToRemove === 0) break; // Stop if target quantity reached
    }
  
    // 2. If quantity still remains, partially remove from the next product
    if (
      remainingQuantityToRemove > 0 &&
      product.products.length > productsToRemove.length
    ) {
      const nextProductIndex = productsToRemove.length; // Get the index of the next product to partially remove. This assumes the loop above processed the products in order.
      if (nextProductIndex < product.products.length) {
        const nextProduct = product.products[nextProductIndex];
        const partialProduct = {
          ...nextProduct,
          quantity: remainingQuantityToRemove,
        };
        productsToRemove.push(partialProduct);
        productIdsToRemove.add(nextProduct.id); // Add product ID to the set
      }
    }
  
    queryClient.setQueryData<ProductList>(["requestProduct"], (oldData) => {
      if (!oldData) return oldData;
  
      const updatedProducts = [...oldData.data]; // Create a copy to avoid direct mutation
  
      // Update quantities of products with matching IDs
      for (const productId of productIdsToRemove) {
        const productIndex = updatedProducts.findIndex(
          (p) => p.id === productId
        );
        if (productIndex !== -1) {
          const productToUpdate = updatedProducts[productIndex];
          const removedProduct = productsToRemove.find(
            (p) => p.id === productId
          );
          if (removedProduct) {
            updatedProducts[productIndex] = {
              ...productToUpdate,
              quantity: productToUpdate.quantity - removedProduct.quantity,
            };
            if (updatedProducts[productIndex].quantity <= 0) {
              // Remove product if quantity is zero or negative
              updatedProducts.splice(productIndex, 1);
            }
          }
        }
      }
  
      return { ...oldData, data: updatedProducts }; // Return updated data
    });
  
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
          atoms.justify_center,
          atoms.align_center,
        ]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />
        </TouchableWithoutFeedback>
        {visible && (
          <Animated.View
            entering={StretchInY.duration(200)}
            exiting={StretchOutY.duration(200)}
            layout={LinearTransition}
            style={[
              atoms.align_center,
              atoms.justify_center,
              atoms.rounded_md,
              {
                backgroundColor: "#fff",
                width: "70%",
                overflow: "hidden",
              },
            ]}
          >
            <View
              style={[
                atoms.align_center,
                atoms.justify_center,
                atoms.flex_row,
                atoms.px_md,
                {
                  height: 70,
                  width: "100%",
                },
              ]}
            >
              <View style={[atoms.flex_1, { backgroundColor: "red" }]} />
              <View
                style={[atoms.flex_2, atoms.justify_center, atoms.align_center]}
              >
                <Text style={[atoms.text_xl, atoms.font_bold]}>
                  <Trans>Choose quantity ready to serve</Trans>
                </Text>
              </View>
              <View
                style={[atoms.flex_1, atoms.justify_center, atoms.align_end]}
              >
                <TouchableOpacity hitSlop={HITSLOP_20} onPress={onClose}>
                  <Close_Stroke2_Corner0_Rounded size="2xl" />
                </TouchableOpacity>
              </View>
            </View>
            <Divider />
            <View style={[atoms.flex_row]}>
              <View style={[atoms.flex_1]}>
                <Text style={[atoms.text_lg]}>
                  {product?.products[0].productName}
                </Text>
                <Text style={[atoms.text_lg]}>
                  <Trans>Qty</Trans>: {product?.quantity}
                </Text>
              </View>
              <View
                style={[
                  atoms.border_l,
                  atoms.flex_1,
                  t.atoms.border_contrast_medium,
                ]}
              >
                <View
                  style={[
                    atoms.align_end,
                    atoms.p_md,
                    atoms.gap_md,
                    { backgroundColor: "#E7EAFE" },
                  ]}
                >
                  <Text style={[atoms.text_xl]}>
                    <Trans>Enter amount</Trans>
                  </Text>
                  <Text style={[atoms.text_3xl]}>{quantity}</Text>
                </View>
                <View style={[atoms.flex_row]}>
                  <View
                    style={[
                      {
                        flexDirection: "column-reverse",
                      },
                    ]}
                  >
                    {Array.from({ length: 3 }).map((_, rowIndex) => (
                      <View key={rowIndex} style={[atoms.flex_row]}>
                        {Array.from({ length: 3 }).map((_, colIndex) => {
                          const number = rowIndex * 3 + colIndex + 1; // Calculate sequential numbers 1-9
                          return (
                            <TouchableOpacity
                              key={number}
                              onPress={() => {
                                addQuantity(number);
                              }}
                              style={[
                                atoms.justify_center,
                                atoms.align_center,
                                rowIndex !== 2 && atoms.border_t,
                                atoms.border_r,
                                t.atoms.border_contrast_medium,
                                {
                                  height: 100,
                                  width: 100,
                                },
                              ]}
                            >
                              <Text style={[atoms.text_4xl]}>{number}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                  <View style={[atoms.flex_1]}>
                    <TouchableOpacity
                      onPress={deleteQuantity}
                      style={[
                        atoms.align_center,
                        atoms.justify_center,
                        {
                          width: "100%",
                          height: 100,
                        },
                      ]}
                    >
                      <DeleteBack_Stroke2_Corner0_Rounded
                        fill={t.palette.negative_500}
                        size="2xl"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={resetQuantity}
                      style={[
                        atoms.flex_1,
                        t.atoms.border_contrast_medium,
                        atoms.border_t,
                        atoms.justify_center,
                        atoms.align_center,
                      ]}
                    >
                      <Text style={[atoms.text_4xl, atoms.font_bold]}>C</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[atoms.flex_row]}>
                  <TouchableOpacity
                    onPress={() => {
                      addQuantity(0);
                    }}
                    style={[
                      {
                        height: 100,
                        width: 200,
                      },
                      atoms.border_t,
                      atoms.border_r,
                      atoms.align_center,
                      atoms.justify_center,
                      t.atoms.border_contrast_medium,
                    ]}
                  >
                    <Text style={[atoms.text_4xl]}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      atoms.flex_1,
                      atoms.border_t,
                      atoms.border_r,
                      atoms.align_center,
                      atoms.justify_center,
                      t.atoms.border_contrast_medium,
                      {
                        backgroundColor: t.palette.primary_500,
                      },
                    ]}
                    onPress={() => {
                      handleServeProduct();
                    }}
                  >
                    <Text
                      style={[
                        atoms.text_4xl,
                        {
                          color: "#fff",
                        },
                      ]}
                    >
                      <Trans>Trả món</Trans>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
};

// export function ListTicket() {
//   const { _ } = useLingui();

//   return <ScrollView contentContainerStyle={[atoms.flex_1]}></ScrollView>;
// }

// export function OrderItem() {
//   const insets = useSafeAreaInsets();
//   const [orderItems, setOrderItems] = useState<{ id: number; total: number }[]>(
//     []
//   );
//   const addItem = ({ id, total }: { id: number; total: number }) => {
//     const existingItem = orderItems.find((item) => item.id === id);
//     if (existingItem?.total === 20) {
//       return;
//     }
//     if (existingItem) {
//       // Update existing item
//       setOrderItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, total: item.total + total } : item
//         )
//       );
//     } else {
//       // Add new item
//       setOrderItems((prev) => [...prev, { id, total }]);
//     }
//   };
//   const removeItem = ({ id, total }: { id: number; total: number }) => {
//     const existingItem = orderItems.find((item) => item.id === id);

//     if (existingItem) {
//       if (existingItem.total === 1) {
//         setOrderItems((prev) => prev.filter((item) => item.id !== id));
//       } else {
//         setOrderItems((prev) =>
//           prev.map((item) =>
//             item.id === id ? { ...item, total: item.total - total } : item
//           )
//         );
//       }
//     }
//   };

//   const getItemById = (id: number) => orderItems.find((item) => item.id === id);

//   const t = useTheme();
//   const basketLabel = React.useMemo(() => {
//     const result = {
//       items: 0,
//       price: 0,
//     };
//     if (orderItems.length === 0) {
//       result;
//     }

//     orderItems.forEach((item) => {
//       const itemDetail = FOOD_ITEMS.find((foodItem) => foodItem.id === item.id);
//       result.items += item.total;
//       result.price += item.total * (itemDetail?.price ?? 0);
//     });
//     return result;
//   }, [orderItems]);
//   return (
//     <View style={[atoms.flex_1]}>
//       <ScrollView
//         contentContainerStyle={[
//           atoms.flex_wrap,
//           atoms.flex_row,
//           atoms.gap_md,
//           atoms.justify_center,
//           atoms.align_start,
//           {
//             paddingTop: 30,
//             paddingBottom: 100,
//           },
//         ]}
//       >
//         {FOOD_ITEMS.map((item) => (
//           <FoodItem
//             key={item.id}
//             item={item}
//             total={getItemById(item.id)?.total}
//             onAddItem={(id) => addItem({ id, total: 1 })}
//             onRemoveItem={(id) => removeItem({ id, total: 1 })}
//           />
//         ))}
//       </ScrollView>
//       {orderItems.length > 0 && (
//         <Animated.View
//           entering={FadeInDown.duration(200)}
//           exiting={FadeOutDown.duration(200)}
//           style={[
//             atoms.absolute,
//             atoms.rounded_md,
//             atoms.px_md,
//             atoms.py_md,
//             atoms.flex_row,
//             atoms.justify_between,
//             {
//               bottom: insets.bottom + 80,
//               // width: "90%",
//               backgroundColor: t.palette.primary_500,
//               left: 30,
//               right: 30,
//             },
//           ]}
//         >
//           <View style={[atoms.flex_row, atoms.gap_xs]}>
//             <Text
//               style={[t.atoms.text_inverted, atoms.text_lg, atoms.font_bold]}
//             >
//               <Trans>Basket</Trans>
//             </Text>
//             <Text style={[t.atoms.text_inverted, atoms.text_lg]}>•</Text>
//             <Text style={[t.atoms.text_inverted, atoms.text_lg]}>
//               {`${basketLabel.items} `}
//               <Trans>Items</Trans>
//             </Text>
//           </View>
//           <View>
//             <Text
//               style={[t.atoms.text_inverted, atoms.text_lg, atoms.font_bold]}
//             >
//               {`${basketLabel.price}`}đ
//             </Text>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// }
// type FoodItemProps = {
//   item: {
//     id: number;
//     name: string;
//     price: number;
//     image: string;
//   };
//   total?: number;
//   onAddItem: (id: number) => void;
//   onRemoveItem: (id: number) => void;
// };
// function FoodItem({ item, onAddItem, total, onRemoveItem }: FoodItemProps) {
//   const { _ } = useLingui();
//   const t = useTheme();
//   return (
//     <View style={[]}>
//       <View>
//         <Image
//           source={{ uri: item.image }}
//           style={[atoms.rounded_md, { aspectRatio: 1, width: 170 }]}
//           contentFit="cover"
//         />
//         <Animated.View
//           entering={FadeIn}
//           exiting={FadeOut}
//           layout={LinearTransition}
//           style={[
//             atoms.absolute,
//             atoms.flex_row,
//             atoms.rounded_full,
//             atoms.border,
//             {
//               borderColor: t.palette.primary_500,
//               backgroundColor: "#fff",
//               bottom: 5,
//               right: 5,
//             },
//           ]}
//         >
//           {total && (
//             <Animated.View
//               entering={FadeIn.duration(200)}
//               exiting={FadeOut.duration(200)}
//               layout={LinearTransition}
//               style={[atoms.flex_row]}
//             >
//               <TouchableOpacity
//                 onPress={() => onRemoveItem(item.id)}
//                 style={[
//                   atoms.justify_center,
//                   atoms.align_center,
//                   {
//                     width: 30,
//                     height: 30,
//                   },
//                 ]}
//               >
//                 <Subtract />
//               </TouchableOpacity>
//               <View
//                 style={[
//                   atoms.align_center,
//                   atoms.justify_center,
//                   { width: 25 },
//                 ]}
//               >
//                 <Text style={[atoms.text_xl]}>{total}</Text>
//               </View>
//             </Animated.View>
//           )}
//           <Animated.View layout={LinearTransition}>
//             <TouchableOpacity
//               onPress={() => onAddItem(item.id)}
//               style={[
//                 atoms.justify_center,
//                 atoms.align_center,
//                 {
//                   width: 30,
//                   height: 30,
//                 },
//               ]}
//             >
//               <Plus size="sm" />
//             </TouchableOpacity>
//           </Animated.View>
//         </Animated.View>
//       </View>
//       <Text>{item.name}</Text>
//       <Text style={[atoms.font_bold]}>{item.price}đ</Text>
//     </View>
//   );
// }
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
