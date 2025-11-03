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

    const prices = await emporixClient.retrieveProductsPrices({
      productIds: ["103155591"],
    });
    console.log(prices);

    const entities = await Promise.all(
      products.map(async (product) => {
        const availability = await emporixClient.retrieveProductAvailability(
          product.id
        );

        const priceInfo =
          prices.find((price) => product.id === price.itemId.id) || prices[0];

        const isOnSale = !!(
          priceInfo && priceInfo.effectiveValue < priceInfo.originalValue
        );

        const price = Money.fromDecimal(
          priceInfo?.effectiveValue ?? 0,
          currency
        );

        const strikethroughPrice = isOnSale
          ? Money.fromDecimal({ amount: priceInfo.effectiveValue, currency })
          : undefined;

        const savingsPercent = strikethroughPrice
          ? 100 - price.percentageOf(strikethroughPrice)
          : undefined;

        return $entity({
          id: product.id,

          base: () => ({
            name: resolveLocalized(product.name, locale),
            sku: product.code,
          }),

          info: () => ({
            image: mapImageFragment(product.media[0]),
          }),

          availability: () => ({
            status: availability.available ? "inStock" : "outOfStock",
            quantity: availability.stockLevel,
          }),

          prices: () => ({
            price,
            isStartingFrom: isOnSale,
            strikethroughPrice: strikethroughPrice,
            isOnSale,
            savingsPercent,
          }),

          quantityPrices: () =>
            priceInfo.priceModel.tierDefinition.tiers
              .filter(
                (tier) => !!priceInfo.tierValues.find((t) => t.id === tier.id)
              )
              .map((tier) => {
                const tierInfo = priceInfo.tierValues.find(
                  (t) => t.id === tier.id
                )!;
                const tierPrice = Money.fromDecimal({
                  amount: tierInfo.priceValue,
                  currency,
                });

                return {
                  quantity: tier.minQuantity.quantity,
                  price: tierPrice,
                  savingsPercent: 1 - price.percentageOf(tierPrice),
                };
              }),

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
        });
      })
    );

    return { entities };
  },
});
