import { GetCurrentCartQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";

export default defineEmporixQuery(GetCurrentCartQuery, async ({ context }) => {
  const { emporixClient } = context;

  const cart = await emporixClient.assertHasCart({ siteCode: "main" });

  return { id: cart.id };
});
