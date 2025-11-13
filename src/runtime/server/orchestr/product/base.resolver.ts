import { Money } from "@screeny05/ts-money";
import { defineEmporixComponentResolver } from "../../middleware";
import {
  ProductBase,
  ProductDescription,
  ProductFlags,
  ProductInfo,
  ProductMedia,
  ProductPrices,
  ProductSeo,
} from "@laioutr-core/canonical-types/entity/product";
import { resolveLocalized } from "../../orchestr-helper/localized";
import { mapImageFragment } from "../../mappers/media";
import { productsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixComponentResolver({
  label: "Emporix Product Resolver",
  entityType: "Product",
  provides: [
    ProductBase,
    ProductDescription,
    ProductInfo,
    ProductMedia,
    ProductPrices,
    ProductSeo,
    ProductFlags,
  ],
  resolve: async ({ entityIds, context, clientEnv, $entity, passthrough }) => {
    const { emporixClient } = context;

    const { locale, currency } = clientEnv;

    const products =
      (passthrough.has(productsPassthroughToken)
        ? passthrough.get(productsPassthroughToken)
        : await emporixClient.searchProducts({
            q: `id:(${entityIds.join(",")})`,
          })) ?? [];

    const prices = await emporixClient.retrieveProductsPrices({
      productIds: entityIds,
    });

    const entities = products.map((product) => {
      const priceInfo = prices.find((price) => product.id === price.itemId.id);

      const isOnSale = !!(
        priceInfo && priceInfo.effectiveValue < priceInfo.originalValue
      );

      const price = Money.fromDecimal(priceInfo?.effectiveValue ?? 0, currency);

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
          slug: product.code,
        }),

        description: () => ({
          html: resolveLocalized(product.description, locale),
        }),

        info: () => ({
          cover: mapImageFragment(product.media[0]),
        }),

        media: () => ({
          images: product.media.map(mapImageFragment),
          media: product.media.map(mapImageFragment),
        }),

        // TODO: Map proper pricing
        prices: () => ({
          price,
          isStartingFrom: isOnSale,
          strikethroughPrice,
          isOnSale,
          savingsPercent,
        }),

        seo: () => ({
          title: resolveLocalized(product.name, locale),
          description: resolveLocalized(product.description, locale),
        }),

        flags: () => [],
      });
    });

    return { entities };
  },
});
