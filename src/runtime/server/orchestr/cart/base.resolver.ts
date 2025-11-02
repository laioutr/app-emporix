import { CartBase, CartCost } from "@laioutr-core/canonical-types/entity/cart";
import { defineEmporixComponentResolver } from "../../middleware";

export default defineEmporixComponentResolver({
  entityType: "Cart",
  label: "Emporix Cart Resolver",
  provides: [CartBase, CartCost],
  resolve: async ({ entityIds, context, clientEnv, $entity }) => {
    const { emporixClient } = context;

    const { currency } = clientEnv;

    const entities = await Promise.all(
      entityIds.map(async (cartId) => {
        const cart = await emporixClient.getCartById(cartId as string);
        console.log(cart);

        return $entity({
          id: cartId,

          base: () => ({
            totalQuantity: 0,
            discountCodes: [],
          }),

          cost: () => ({
            subtotal: {
              amount: 0,
              currency,
            },
            subtotalIsEstimated: false,
            total: { amount: 0, currency },
            totalIsEstimated: false,
            totalTax: {
              amount: 0,
              currency,
            },
            totalTaxIsEstimated: false,
            taxesIncluded: true,
            totalDuty: { amount: 0, currency: "USD" },
            totalDutyIsEstimated: true,
            dutiesIncluded: false,
          }),
        });
      })
    );

    return { entities };
  },
});
