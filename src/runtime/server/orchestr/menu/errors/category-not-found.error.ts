import { NotFoundError } from "@ebec/http";

/**
 * Thrown when a product that should be added to the cart is not found.
 *
 * @public
 */
export class CategoryNotFoundError extends NotFoundError {
  declare data: { [key: string]: string };
  static readonly code = "Category_NOT_FOUND";

  constructor(key: string) {
    super({
      message: `Category with key ${key} not found`,
      code: CategoryNotFoundError.code,
      data: { key },
    });
  }
}

export default () => {};
