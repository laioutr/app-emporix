import { ProductBySlugQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";

export default defineEmporixQuery(
  ProductBySlugQuery,
  async ({ context, input }) => {
    const { emporixClient } = context;

    const { slug } = input;

    const products = await emporixClient.searchProducts({ q: `code:${slug}` });

    const product = products[0];

    return { id: product.id };
  }
);
