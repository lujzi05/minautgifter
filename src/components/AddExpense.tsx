import { useState } from "react";
import { db } from "../db";
import type { Category } from "../types";
import { CATEGORIES } from "../types";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";

const isValidNumber = (value: string) => {
  if (!value.trim()) return false;
  const number = Number(value);
  return !Number.isNaN(number);
};

export function AddExpense() {
  const { category: paramCategory } = useParams<{ category: Category }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>(paramCategory || "general");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const addExpense = async () => {
    if (!isValidNumber(amount)) return;

    await db.expenses.add({
      id: uuidv4(),
      amount: Number(amount),
      category,
      note,
      date: new Date(date).toISOString()
    });

    setAmount("");
    setNote("");
    navigate("/"); // Go back to dashboard after adding
  };

  const amountIsValid = isValidNumber(amount);

  return (
    <div>
      <h2>Add Expense</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0"
      />
      {!amountIsValid && amount.trim().length > 0 && (
        <p style={{ color: "red", margin: "0.25rem 0" }}>
          Please enter a valid number.
        </p>
      )}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />


      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>

      <input
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button onClick={addExpense}>Add</button>

      <button
        onClick={() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          setDate(d.toISOString().slice(0, 10));
        }}
      >
        Yesterday
      </button>

      <button onClick={() => navigate("/")}>Cancel</button>
    </div>
  );
}