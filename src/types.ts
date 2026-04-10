export type Category =
  | "food"
  | "restaurant"
  | "transport"
  | "health"
  | "essentials"
  | "general";

export const CATEGORIES: Category[] = [
  "food",
  "restaurant",
  "transport",
  "health",
  "essentials",
  "general"
];

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  date: string;   // ISO string
  note?: string;
};