import type { Address } from "./address";

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
}
