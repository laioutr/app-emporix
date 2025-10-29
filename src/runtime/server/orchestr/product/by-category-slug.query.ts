import { ProductsByCategorySlugQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";
import { productsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixQuery(
  ProductsByCategorySlugQuery,
  async ({ context, passthrough }) => {
    const { emporixClient } = context;

    const products = await emporixClient.searchProducts({});

    passthrough.set(productsPassthroughToken, products);

    return { ids: products.map((product) => product.id) };
  }
);
