import { CartAddItemsAction } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixAction } from "../../middleware";
import { ProductsNotFoundError } from "../product/errors/products-not-found.error";

export default defineEmporixAction(
  CartAddItemsAction,
  async ({ context, input }) => {
    const { emporixClient } = context;

    const products = input.filter((i) => i.type === "product");

    const data = await emporixClient.searchProducts({
      q: `id:(${products.map((product) => product.productId).join(",")})`,
    });

    const missing = products.filter(
      (product) => !data.find((d) => d.id === product.productId)
    );

    if (missing.length > 1)
      throw new ProductsNotFoundError(missing.map((m) => m.productId));

    const prices = await emporixClient.retrieveProductsPrices({
      productIds: products.map((p) => p.productId),
    });

    const missingPriceInfo = products.filter(
      (product) =>
        !prices.find((price) => price.itemId.id === product.productId)
    );

    if (missingPriceInfo.length > 1)
      throw new ProductsNotFoundError(missing.map((m) => m.productId));

    await emporixClient.addItemToCart({
      items: products.map((product) => {
        const priceInfo = prices.find(
          (price) => price.itemId.id === product.productId
        )!;

        return {
          yrn: data.find((d) => d.id === product.productId)!.yrn,
          price: {
            priceId: priceInfo.priceId,
            effectiveAmount: priceInfo.effectiveValue,
            originalAmount: priceInfo.originalValue,
            currency: priceInfo.currency,
          },
          quantity: product.quantity,
        };
      }),
      siteCode: "main",
    });
  }
);
