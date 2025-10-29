import { ProductVariantsLink } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixLink } from "../../middleware";
import { variantsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixLink(
  ProductVariantsLink,
  async ({ entityIds, context, passthrough }) => {
    const { emporixClient } = context;

    const res = await Promise.all(
      entityIds.map(
        async (entityId) =>
          [entityId, await emporixClient.listProductVariants(entityId)] as const
      )
    );

    passthrough.set(
      variantsPassthroughToken,
      res.flatMap((r) => r[1])
    );

    return {
      links: res.map(([productId, variants]) => ({
        sourceId: productId,
        targetIds: variants.map((variant) => variant.id),
      })),
    };
  }
);
