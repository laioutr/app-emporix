import type { LocalizedObject } from "./localized";
import type { Media } from "./media";

export interface Product {
  id: string;
  code: string;
  name: LocalizedObject;
  description: LocalizedObject;
  media: Array<Media>;
}
