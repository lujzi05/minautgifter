import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { CATEGORIES } from "../types";
import { useState } from "react";

export function ExpenseList() {
  const expenses = useLiveQuery(() => db.expenses.toArray(), []);
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredExpenses = expenses?.filter((e) => {
    const expenseMonth = e.date.slice(0, 7);
    const matchesMonth = expenseMonth === selectedMonth;
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
    return matchesMonth && matchesCategory;
  });

  const total = filteredExpenses?.reduce((sum, e) => sum + e.amount, 0);

  if (!expenses) return <p>Loading...</p>;

  return (
    <div>
      <h2>Expenses</h2>

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="All">All</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>


      <ul>
        {filteredExpenses?.map((e) => (
          <li key={e.id}>
            {e.id}: 
            {new Date(e.date).toLocaleDateString()} — 
            {e.amount} — 
            {e.category} — 
            {e.note}
          </li>
        ))}
      </ul>

      <h3>Total: {total}</h3>


    </div>
  );
}
