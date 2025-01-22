import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAudioPlayer, AudioModule } from "expo-audio";
import Toast from "react-native-toast-message";
import { useFontScale } from "@/state/preferences/font-scale";
import { Alert } from "react-native";
import { useAssets } from "expo-asset";
import { Audio } from "expo-av";

export const PATH = {
  BASE_URL: "https://menu.1erp.vn",
  AUTH: {
    LOGIN: "/be-order/api/v1/auth/login",
  },
  STORE: {
    CHOOSE_STORE: "/be-order/api/v1/auth/choose-store",
  },
  PRODUCT: {
    REQUEST: "/be-order/api/v1/request-product",
  },
  REQUEST: "/be-order/api/v1/request",
};

const updateProductsStatus = async ({
  productIds,
  status,
  accessToken,
  returnedQuantity,
}: {
  productIds: string[];
  status: "COMPLETED";
  accessToken: string;
  returnedQuantity: number;
}) => {
  const response = await fetch(PATH.BASE_URL + PATH.PRODUCT.REQUEST, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      status,
      ids: productIds,
      returnedQuantity,
    }),
  });

  return response.json();
};

export const useProducts = (accessToken?: string) => {
  return useQuery<ProductList>({
    queryKey: ["requestProduct"],
    queryFn: () =>
      productService.requestProduct({
        verifyToken: accessToken!,
      }),
    enabled: !!accessToken, // Only run query when we have an accessToken
  });
};
export const useGetRealTimeProducts = (accessToken: string) => {
  const fontScale = useFontScale();
  const [assets, error] = useAssets([require("../../assets/audio/bell.mp3")]);
  const bellSound = useAudioPlayer(assets ? assets[0] : null);
  const [sound, setSound] = useState();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audio/bell.mp3")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
    // try {
    //   await bellSound.seekTo(0); // Reset to beginning
    //   bellSound.play();
    // } catch (error) {
    //   console.error("Error playing sound:", error);
    // }
  };
  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }
    })();
  }, []);

  useEffect(() => {
    if (accessToken) {
      const newSocket = io(`${PATH.BASE_URL}`, {
        auth: {
          token: accessToken,
        },
        extraHeaders: {
          Authorization: accessToken,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      newSocket.on(
        "request.request-confirm-order",
        async (incProducts: Product[]) => {
          const newProducts = incProducts;
          if (newProducts.length > 0) {
            await playSound();
            Toast.show({
              type: "success",
              text1: "Có sản phẩm mới",
              text2: newProducts.map((p) => p.productName).join(", "),
              text2Style: [
                {
                  fontSize: fontScale * 20 * (fontScale > 2 ? 0.8 : 1),
                  color: "#000",
                },
              ],
            });
          }
          queryClient.setQueryData<ProductList>(["requestProduct"], (old) => {
            if (!old) {
              return {
                data: newProducts,
                totalItems: newProducts.length,
                totalPages: 1,
              };
            }

            const mergedData = old.data.map((existingProduct) => {
              const updatedProduct = newProducts.find(
                (p) => p.id === existingProduct.id
              );
              return updatedProduct || existingProduct;
            });

            // Add any new products that don't exist in the current data
            const newUniqueProducts = newProducts.filter(
              (newProduct) => !old.data.some((p) => p.id === newProduct.id)
            );

            return {
              ...old,
              data: [...mergedData, ...newUniqueProducts],
              totalItems: mergedData.length + newUniqueProducts.length,
            };
          });
        }
      );

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        bellSound.remove();
      };
    }
  }, [accessToken]);

  const emitEvent = useCallback(
    (event: string, data: any) => {
      if (!socket) {
        console.warn("Socket instance not available");
        return;
      }

      if (!socket.connected) {
        console.warn("Socket is not connected");
        return;
      }

      try {
        console.log(`Emitting ${event}:`, data);
        socket.emit(event, data, (response: any) => {
          console.log(`Response for ${event}:`, response);
        });
      } catch (error) {
        console.error(`Error emitting ${event}:`, error);
      }
    },
    [socket]
  );

  return {
    socket,
    emit: emitEvent,
  };
};

const requestOrder = async ({
  storeId,
  accessToken,
}: {
  storeId: string;
  accessToken: string;
}): Promise<Orders> => {
  const response = await fetch(
    PATH.BASE_URL + PATH.REQUEST + `?storeId=${storeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.json();
};

const chooseStore = async ({
  storeId,
  verifyToken,
}: {
  storeId: string;
  verifyToken: string;
}): Promise<{ user: User }> => {
  const response = await fetch(PATH.BASE_URL + PATH.STORE.CHOOSE_STORE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeId,
      token: verifyToken,
    }),
  });

  return response.json();
};

const login = async ({
  username = "example8386",
  password = "MatKhau@123",
}: {
  username: string;
  password: string;
}): Promise<{
  userStores: {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    storeId: string;
    userId: string;
    role: "STORE_OWNER" | string; // You can make this more specific by adding other possible role values
    store: Store;
  }[];
  verifyToken: string;
}> => {
  const response = await fetch(PATH.BASE_URL + PATH.AUTH.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return response.json();
};

const requestProduct = async ({
  verifyToken,
}: {
  verifyToken: string;
}): Promise<ProductList> => {
  const response = await fetch(PATH.BASE_URL + PATH.PRODUCT.REQUEST, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${verifyToken}`,
    },
  });

  return response.json();
};

export const productService = {
  login,
  requestProduct,
  chooseStore,
  requestOrder,
  updateProductsStatus,
};

interface Store {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  email: string | null;
  thumbnail: string | null;
  phone: string | null;
  address: string | null;
  slogan: string | null;
  binBank: string | null;
  consumerId: string | null;
}

interface UserStore {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  storeId: string;
  userId: string;
  role: "STORE_OWNER" | string;
  store: Store;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  name: string;
  email: string | null;
  phone: string;
  isActive: boolean;
  tokenVersion: number;
  isSystemAdmin: boolean;
  address: string;
  accessToken: string;
  refreshToken: string;
  userStore: UserStore[];
}

enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  // Add other possible status values
}

export interface ProductList extends Pagination {
  data: Product[];
}

export interface Product {
  id: string;
  createdAt: string; // or Date
  productId: string;
  productName: string;
  quantity: number;
  note: string | null;
  price: number;
  status: OrderStatus;
  request: Request;
}
interface Pagination {
  totalItems: number;
  totalPages: number;
}

export interface GroupProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  items: {
    note: string | null;
    quantity: number;
    products: Product[];
  }[];
}

export interface Request {
  id: string;
  table: Table;
}

export interface Table {
  id: string;
  name: string;
  zone: Zone;
}

export interface Zone {
  id: string;
  name: string;
}

interface Customer {
  name: string;
}

interface SessionCustomer {
  id: string;
  sessionId: string;
  customer: Customer;
}
export interface Order {
  id: string;
  createdAt: string;
  type: "STAFF" | "ORDER" | "PAYMENT";
  status: "PENDING" | string; // Add other status types if needed
  requestProducts: Product[];
  sessionCustomer: SessionCustomer;
  table: Table;
}

export interface Orders extends Pagination {
  data: Order[];
}

export interface GroupedProductsByTable {
  tableId: string;
  tableName: string;
  zoneName: string;
  products: GroupProduct[];
}
