export type Category =
  | "earrings"
  | "rings"
  | "bracelets"
  | "necklaces"
  | "mangalsutras";

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: Category;
  description?: string;
  detailedDescription?: string; // added field

  sizes: string[];
}

export const categories: Category[] = [
  "earrings",
  "rings",
  "bracelets",
  "necklaces",
  "mangalsutras",
];

export const categoryLabels: Record<Category, string> = {
  earrings: "earrings",
  rings: "rings",
  bracelets: "bracelets",
  necklaces: "necklaces",
  mangalsutras: "mangalsutras",
};