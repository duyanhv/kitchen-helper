import { useEffect } from "react";
import io from "socket.io-client";

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
};

export const useGetRealTimeProducts = (accessToken: string) => {
  useEffect(() => {
    if (accessToken) {
      const socket = io(`${PATH.BASE_URL}`, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: accessToken,
            },
          },
        },
      }); // Replace with your server address

      socket.on("connect", () => {
        console.log("Connected to server");
      });
      socket.on("request.request-confirm-order", (data) => {
        console.log("Received message:", data);
      });
      socket.onAny((eventName, ...args) => {
        console.log("Received event:", eventName, ...args);
        // ...
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [accessToken]);
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

interface ProductList extends Pagination {
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
