import { CartAddItemsAction } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixAction } from "../../middleware";
import { ProductsNotFoundError } from "../product/errors/products-not-found.error";

export default defineEmporixAction(
  CartAddItemsAction,
  async ({ context, input, clientEnv }) => {
    const { emporixClient } = context;

    const { currency } = clientEnv;

    const products = input.filter((i) => i.type === "product");

    const data = await emporixClient.searchProducts({
      q: `id:(${products.map((product) => product.productId).join(",")})`,
    });

    const missing = products.filter(
      (product) => !data.find((d) => d.id === product.productId)
    );

    if (missing.length > 1)
      throw new ProductsNotFoundError(missing.map((m) => m.productId));

    await emporixClient.addItemToCart({
      items: products.map((product) => ({
        yrn: data.find((d) => d.id === product.productId)!.yrn,
        quantity: product.quantity,
      })),
      currency,
      siteCode: "main",
    });
  }
);
