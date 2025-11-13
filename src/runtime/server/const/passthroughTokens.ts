import { createPassthroughToken } from "#imports";
import type { Category } from "../client/types/category";
import type { Product } from "../client/types/product";

/** Store flattened category tree in passthrough */
export const categoriesPassthroughToken = createPassthroughToken<Category[]>(
  "@laioutr-app/emporix/categoriesPassthroughToken"
);

export const productsPassthroughToken = createPassthroughToken<Product[]>(
  "@laioutr-app/emporix/productsPassthroughToken"
);

export const variantsPassthroughToken = createPassthroughToken<Product[]>(
  "@laioutr-app/emporix/variantsPassthroughToken"
);
