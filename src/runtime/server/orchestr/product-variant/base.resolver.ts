import { Money } from "@screeny05/ts-money";
import { defineEmporixComponentResolver } from "../../middleware";
import {
  ProductVariantAvailability,
  ProductVariantBase,
  ProductVariantInfo,
  ProductVariantOptions,
  ProductVariantPrices,
  ProductVariantQuantityPrices,
  ProductVariantQuantityRule,
  ProductVariantShipping,
} from "@laioutr-core/canonical-types/entity/product-variant";
import { resolveLocalized } from "../../orchestr-helper/localized";
import { mapImageFragment } from "../../mappers/media";
import { variantsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixComponentResolver({
  label: "Emporix ProductVariant Resolver",
  entityType: "ProductVariant",
  provides: [
    ProductVariantBase,
    ProductVariantInfo,
    ProductVariantAvailability,
    ProductVariantPrices,
    ProductVariantQuantityPrices,
    ProductVariantQuantityRule,
    ProductVariantShipping,
    ProductVariantOptions,
  ],
  resolve: async ({ entityIds, context, clientEnv, $entity, passthrough }) => {
    const { emporixClient } = context;

    const { locale, currency } = clientEnv;

    const products =
      (passthrough.has(variantsPassthroughToken)
        ? passthrough.get(variantsPassthroughToken)
        : await emporixClient.searchProducts({
            q: `id:(${entityIds.join(",")})`,
          })) ?? [];

    // const prices = await emporixClient.retrieveProductsPrices({
    //   productIds: entityIds,
    //   site: "main",
    //   currency,
    // });
    // console.log(prices);

    const entities = products.map((product) =>
      $entity({
        id: product.id,

        base: () => ({
          name: resolveLocalized(product.name, locale),
          sku: product.code,
        }),

        info: () => ({
          image: mapImageFragment(product.media[0]),
        }),

        // TODO: Map proper availability
        availability: () => ({
          status: "inStock",
          quantity: 999,
        }),

        // TODO: Map proper pricing
        prices: () => ({
          price: Money.fromDecimal(200, currency),
          isStartingFrom: false,
          strikethroughPrice: undefined,
          isOnSale: false,
          savingsPercent: 0,
        }),

        // TODO: Map proper quanity prices
        quantityPrices: () => [],

        // TODO: Map proper quantity rules
        quantityRule: () => ({
          min: 0,
          max: Number.MAX_SAFE_INTEGER,
          increment: 1,
        }),

        // TODO: Map proper shipping
        shipping: () => ({ required: false }),

        // TODO: Map proper options
        options: () => ({ selected: [] }),
      })
    );

    return { entities };
  },
});
