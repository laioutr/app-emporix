import type { LocalizedObject } from "./localized";

export interface Quantity {
  quantity: number;
  unitCode: string;
}

export interface Tier {
  id: string;
  minQuantity: Quantity;
}

export interface TierDefinition {
  tierType: string;
  tiers: Array<Tier>;
}

export interface PriceDetail {
  netValue: number;
  grossValue: number;
  taxValue: number;
}

export interface PriceInfo {
  originalValue: PriceDetail;
  effectiveValue: PriceDetail;
  totalValue: PriceDetail;
}

export interface Price {
  priceId: string;
  itemId: { itemType: string; id: string };
  site: { code: string };
  currency: string;
  location: { countryCode: string };
  quantity: Quantity;
  includesTax: boolean;
  priceModel: {
    id: string;
    name: LocalizedObject;
    description: LocalizedObject;
    includesTax: boolean;
    includesMarkup: boolean;
    measurementUnit: Quantity;
    tierDefinition: TierDefinition;
    default: boolean;
  };
  tierValues: Array<{ id: string; priceValue: number }>;
  tax: { taxClass: string; taxRate: number; prices: PriceInfo };
  originalValue: number;
  effectiveValue: number;
  totalValue: number;
}
