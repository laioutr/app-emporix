import { ProductsByCategoryIdQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";
import { productsPassthroughToken } from "../../const/passthroughTokens";

export default defineEmporixQuery(
  ProductsByCategoryIdQuery,
  async ({ context, passthrough, input, pagination, sorting }) => {
    const { emporixClient, availableFilters, availableSortings } = context;

    const { categoryId } = input;

    const assignments = await emporixClient.listCategoryAssignments(
      categoryId,
      {
        pageNumber: pagination.page,
        pageSize: pagination.limit,
        sort: sorting,
      }
    );

    const products = await emporixClient.searchProducts({
      q: `id:(${assignments.map((assignment) => assignment.ref.id).join(",")})`,
    });

    passthrough.set(productsPassthroughToken, products);

    return {
      ids: products.map((product) => product.id),
      availableFilters,
      availableSortings,
    };
  }
);
