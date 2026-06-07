export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  colour: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
