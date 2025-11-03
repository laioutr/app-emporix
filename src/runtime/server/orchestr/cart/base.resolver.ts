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

        return $entity({
          id: cartId,

          base: () => ({
            totalQuantity: cart.items.reduce(
              (acc, curr) => acc + curr.effectiveQuantity,
              0
            ),
            discountCodes: [],
          }),

          cost: () => ({
            subtotal: {
              amount: cart.subTotalPrice?.amount ?? 0,
              currency: cart.subTotalPrice?.currency ?? currency,
            },
            subtotalIsEstimated: !cart.subTotalPrice,
            total: {
              amount: cart.totalPrice?.amount ?? 0,
              currency: cart.totalPrice?.currency ?? currency,
            },
            totalIsEstimated: !cart.totalPrice,
            totalTax: {
              amount: cart.totalTax?.amount ?? 0,
              currency: cart.totalTax?.currency ?? currency,
            },
            totalTaxIsEstimated: !cart.totalTax,
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
