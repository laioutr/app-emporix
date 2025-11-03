import { NotFoundError } from "@ebec/http";

/**
 * Thrown when a product that should be added to the cart is not found.
 *
 * @public
 */
export class ProductsMissingPriceInfo extends NotFoundError {
  declare data: { [key: string]: string };
  static readonly code = "PRODUCTS_MISSING_PRICE_INFO";

  constructor(key: string[]) {
    super({
      message: `Products with keys ${key.join(",")} are missing price info`,
      code: ProductsMissingPriceInfo.code,
      data: { key },
    });
  }
}

export default () => {};
