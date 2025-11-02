import { ProductsByCategoryIdQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";
import { productsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixQuery(
  ProductsByCategoryIdQuery,
  async ({ context, passthrough, input }) => {
    const { emporixClient } = context;

    const { categoryId } = input;

    const res = await emporixClient.listCategoryAssignments(categoryId);

    const products = res.flatMap((r) => r.ref);

    passthrough.set(productsPassthroughToken, products);

    return { ids: products.map((product) => product.id) };
  }
);
