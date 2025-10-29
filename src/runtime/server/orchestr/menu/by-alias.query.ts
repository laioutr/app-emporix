import { categoriesPassthroughToken } from "../../const/passthroughTokens";
import { defineEmporixQuery } from "../../middleware";
import { MenuByAliasQuery } from "@laioutr-core/canonical-types/ecommerce";

export default defineEmporixQuery(
  MenuByAliasQuery,
  async ({ context, input, passthrough }) => {
    const { emporixClient } = context;

    const { alias } = input;

    const categories = await emporixClient.listCategories({
      parentCategoryId: alias === "root" ? undefined : alias,
    });

    //FIXME: Current Emporix API is bugged. It still returns child categories even though we tell it not to
    const filtered =
      alias === "root"
        ? categories.filter((category) => !category.parentId)
        : categories;

    passthrough.set(categoriesPassthroughToken, filtered);

    return { ids: filtered.map((c) => c.id), total: filtered.length };
  }
);
