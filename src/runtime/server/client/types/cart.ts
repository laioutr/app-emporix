import type { Address } from "./address";
import type { Product } from "./product";

export interface LineItem {
  id: string;
  type: "INTERNAL" | "EXTERNAL";
  product: Pick<Product, "id"> & Partial<Omit<Product, "id">>;
  itemYrn: string;
  quantity: number;
  effectiveQuantity: number;
  price: { originalAmount: number; effectiveAmount: number; currency: string };
  unitPrice: { amount: number; currency: string };
  itemPrice: { amount: number; currency: string };
}

export interface Cart {
  id: string;
  currency: string;
  siteCode: string;
  sessionId: string;
  metadata: {
    createdAt: string;
    modifiedAt: string;
    version: number;
  };
  leadTime: number;
  addresses: Array<Address>;
  items: Array<LineItem>;
  subTotalPrice?: { amount: number; currency: string };
  shipping?: {
    fee: { amount: number; currency: string };
    total: {
      subtotal: number;
      totalTax: number;
      total: number;
      discount: number;
    };
  };
  totalTax?: { amount: number; currency: string };
  totalDiscount?: { amount: number; currency: string };
  totalPrice?: { amount: number; currency: string };
}
