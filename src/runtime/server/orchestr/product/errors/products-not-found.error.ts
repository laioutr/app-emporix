import { NotFoundError } from "@ebec/http";

/**
 * Thrown when a product that should be added to the cart is not found.
 *
 * @public
 */
export class ProductsNotFoundError extends NotFoundError {
  declare data: { [key: string]: string };
  static readonly code = "PRODUCTS_NOT_FOUND";

  constructor(key: string[]) {
    super({
      message: `Products with keys ${key.join(",")} not found`,
      code: ProductsNotFoundError.code,
      data: { key },
    });
  }
}

export default () => {};
