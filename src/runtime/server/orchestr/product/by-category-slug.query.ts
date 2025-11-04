import { ProductsByCategorySlugQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQuery } from "../../middleware";
import { productsPassthroughToken } from "../../const/passthroughTokens";
import { flattenTree } from "../../utils/trees";
import { CategoryNotFoundError } from "../menu/errors/category-not-found.error";

export default defineEmporixQuery(
  ProductsByCategorySlugQuery,
  async ({ context, passthrough, input, pagination, sorting }) => {
    const { emporixClient, availableFilters, availableSortings } = context;

    const { categorySlug } = input;

    const categories = await emporixClient.listCategories({});

    const category = flattenTree(categories, "subcategories").find(
      (c) => c.code === categorySlug || c.id === categorySlug
    );

    if (!category) throw new CategoryNotFoundError(categorySlug);

    const assignments = await emporixClient.listCategoryAssignments(
      category.id,
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
