import { categoriesPassthroughToken } from "../../const/passthroughTokens";
import { defineEmporixComponentResolver } from "../../middleware";
import { MenuItemBase } from "@laioutr-core/canonical-types/entity/menuItem";

export default defineEmporixComponentResolver({
  label: "Emporix MenuItem Resolver",
  entityType: "MenuItem",
  provides: [MenuItemBase],
  resolve: async ({ entityIds, context, $entity, passthrough }) => {
    const { emporixClient } = context;

    // Both results should be in flattened form.
    const categories =
      passthrough.get(categoriesPassthroughToken) ??
      (await Promise.all(
        entityIds.map((categoryId) => emporixClient.getCategory(categoryId))
      ));

    const entities = categories
      .filter((c) => !!c)
      .map((category) =>
        $entity({
          id: category.id,

          base: () => ({
            name: category.name ?? "",
            type: "reference",
            reference: {
              type: "category",
              slug: category.code || category.id,
              id: category.id ?? "",
            },
            childIds: (category.subcategories ?? []).map((child) => child.id),
            parentId: category.parentId,
          }),
        })
      );

    return { entities };
  },
  cache: {
    strategy: "ttl",
    ttl: "1 hour",
  },
});
