import Dexie from "dexie";
import type { Table } from "dexie";
import type { Expense } from "./types";

class ExpenseDB extends Dexie {
  expenses!: Table<Expense>;

  constructor() {
    super("expense-db");
    this.version(1).stores({
      expenses: "id, date, category"
    });
  }
}

export const db = new ExpenseDB();