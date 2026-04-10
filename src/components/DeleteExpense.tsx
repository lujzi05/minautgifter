import { useState } from "react";
import { db } from "../db";


export function DeleteExpense() {
  const [id, setId] = useState("");

  const deleteExpense = async () => {
    if (!id) return;

    try {
      await db.expenses.delete(id);
      alert("Expense deleted successfully!");
      setId("");
    } catch (error) {
      alert("Failed to delete expense. Please check the ID.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Delete Expense</h2>

      <input
        placeholder="Enter Expense ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button onClick={deleteExpense}>Delete</button>
    </div>
  );
}