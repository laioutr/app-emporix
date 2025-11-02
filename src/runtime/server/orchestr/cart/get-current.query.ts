import { GetCurrentCartQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";

export default defineEmporixQuery(
  GetCurrentCartQuery,
  async ({ context, clientEnv }) => {
    const { emporixClient } = context;

    const { currency } = clientEnv;

    const cart = await emporixClient.assertHasCart({
      siteCode: "main",
      currency,
    });

    return cart;
  }
);
