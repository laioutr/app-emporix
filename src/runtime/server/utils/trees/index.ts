/**
 * Flattens a tree structure into a flat array.
 *
 * @param input - A single object or an array of objects
 * @param childrenKey - The key that contains child nodes (e.g., "children")
 * @returns A flat array of all nodes (depth-first)
 */
export function flattenTree<T = Record<string, unknown>>(
  input: T | T[],
  childrenKey: keyof T
): T[] {
  const result: T[] = [];

  function recurse(nodes: T[]) {
    for (const node of nodes) {
      result.push(node);

      const children = node[childrenKey];
      if (Array.isArray(children) && children.length > 0) {
        recurse(children as T[]);
      }
    }
  }

  if (Array.isArray(input)) {
    recurse(input);
  } else {
    recurse([input]);
  }

  return result;
}
