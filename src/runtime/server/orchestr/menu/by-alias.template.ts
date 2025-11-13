import { MenuByAliasQuery } from "@laioutr-core/canonical-types/ecommerce";
import { defineEmporixQueryTemplateProvider } from "../../middleware";

export default defineEmporixQueryTemplateProvider({
  for: MenuByAliasQuery,
  run: async ({ context }) => {
    const { emporixClient } = context;

    const categories = await emporixClient.listCategories({ onlyRoots: false });

    return [
      {
        input: {
          alias: "root",
        },
        label: "Root",
      },
      ...categories.map((category) => ({
        input: {
          alias: category.id,
        },
        label: category.name ?? category.id,
      })),
    ];
  },
});
