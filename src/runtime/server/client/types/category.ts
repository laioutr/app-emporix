import type { Media } from "./media";

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  code: string;
  media?: Media;
  subcategories: Category[];
}
