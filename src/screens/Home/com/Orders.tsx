export interface Ticket {
  id: number;
  name: string;
  type: TicketType;
  foodItem: FoodItem[];
  createdAt: number;
}

export type TicketType =
  | "all"
  | "dine-in"
  | "take-away"
  | "shipping"
  | "partner";

export interface FoodItem {
  id: number;
  name: string;
  quantities: number;
  unitType: UnitType;
  status: OrderStatus;
}

export interface FoodTicket extends FoodItem {
  tickets: Ticket[]
}

export type OrderStatus = "pending" | "delivered" | "progressing" | "cancelled";
export type UnitType = "pcs" | "glass";
