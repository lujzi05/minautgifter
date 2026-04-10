import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { CATEGORIES, type Category } from "../types";
import { useState } from "react";
import type { Expense } from "../types";

const isValidNumber = (value: string) => {
  if (!value.trim()) return false;
  const number = Number(value);
  return !Number.isNaN(number);
};

export function Insights() {
  const expenses = useLiveQuery<Expense[]>(() => db.expenses.orderBy("date").reverse().toArray(), []);
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("general");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMessage, setErrorMessage] = useState("");

  const filteredExpenses = expenses?.filter((e) => {
    const expenseMonth = e.date.slice(0, 7);
    const matchesMonth = expenseMonth === selectedMonth;
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
    return matchesMonth && matchesCategory;
  });

  const total = filteredExpenses?.reduce((sum, e) => sum + e.amount, 0);

  const resetEditState = () => {
    setEditingId(null);
    setEditAmount("");
    setEditCategory("general");
    setEditNote("");
    setEditDate(new Date().toISOString().slice(0, 10));
    setErrorMessage("");
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditNote(expense.note ?? "");
    setEditDate(expense.date.slice(0, 10));
    setErrorMessage("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!isValidNumber(editAmount)) {
      setErrorMessage("Amount must be a valid number.");
      return;
    }

    await db.expenses.update(editingId, {
      amount: Number(editAmount),
      category: editCategory,
      note: editNote,
      date: new Date(editDate).toISOString()
    });

    resetEditState();
  };

  const deleteExpense = async () => {
    if (!editingId) return;
    await db.expenses.delete(editingId);
    resetEditState();
  };

  if (!expenses) return <p>Loading...</p>;

  return (
    <div>
      <h2>Insights</h2>

      <div>
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
      </div>

      <ul>
        {filteredExpenses?.map((e) => (
          <li
            key={e.id}
            onClick={() => startEditing(e)}
            style={{
              padding: "0.5rem",
              cursor: "pointer",
              backgroundColor: editingId === e.id ? "#f0f9ff" : "transparent",
              borderRadius: "0.25rem",
              marginBottom: "0.25rem"
            }}
          >
            <strong>{new Date(e.date).toLocaleDateString()}</strong>
            {" — "}
            {e.amount.toFixed(2)}
            {" — "}
            {e.category}
            {e.note ? ` — ${e.note}` : ""}
          </li>
        ))}
      </ul>

      <h3>Total: {total?.toFixed(2) ?? 0}</h3>

      {editingId && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "0.5rem" }}>
          <h3>Edit expense</h3>

          <div>
            <label>
              Amount
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                step="0.01"
              />
            </label>
          </div>

          <div>
            <label>
              Date
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Category
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Note
              <input
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </label>
          </div>

          {errorMessage && (
            <p style={{ color: "red" }}>{errorMessage}</p>
          )}

          <button onClick={saveEdit}>Save changes</button>
          <button onClick={deleteExpense} style={{ marginLeft: "0.5rem" }}>
            Delete expense
          </button>
          <button onClick={resetEditState} style={{ marginLeft: "0.5rem" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}