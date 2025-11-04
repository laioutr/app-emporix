import {
  type QueryWireRequestFilter,
  isRangeFilter,
} from "@laioutr-core/orchestr/types";

export const mapSelectedFiltersToEmporixQuery = (
  filters: QueryWireRequestFilter
) => {
  const queries = [] as string[];

  for (const k in filters) {
    const filter = filters[k];

    if (isRangeFilter(filter)) {
      queries.push(
        `${k}:(>=${filter.min ?? Number.MIN_SAFE_INTEGER} AND <=${
          filter.max ?? Number.MAX_SAFE_INTEGER
        })`
      );
    } else if (typeof filter === "boolean") {
      queries.push(`${k}:${filter}`);
    } else {
      queries.push(`${k}:(${filter.join(",")})`);
    }
  }

  return queries.join(" AND ");
};
