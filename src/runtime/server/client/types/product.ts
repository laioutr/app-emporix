import type { LocalizedObject } from "./localized";
import type { Media } from "./media";

export interface Product {
  id: string;
  yrn: string;
  code: string;
  name: LocalizedObject;
  description: LocalizedObject;
  media: Array<Media>;
}

export interface ProductAssignment {
  id: string;
  categoryId: string;
  ref: Pick<Product, "id"> & Partial<Omit<Product, "id">>;
}
