export interface OrderItem {
  id: number;
  productName: string;
  colour: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  subTotal: number;
  shippingFee: number;
  total: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface PlaceOrderResponse {
  order: Order;
  payFastUrl: string;
  payFastFields: { [key: string]: string };
}

export interface PlaceOrderRequest {
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  items: { variantId: number; quantity: number }[];
}
