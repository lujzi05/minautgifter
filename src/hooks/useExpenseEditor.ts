import { useState } from "react";
import { db } from "../db";
import type { Category, Expense } from "../types";

const isValidNumber = (value: string) => {
  if (!value.trim()) return false;
  const number = Number(value);
  return !Number.isNaN(number);
};

export function useExpenseEditor() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("general");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMessage, setErrorMessage] = useState("");

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

  return {
    editingId,
    editAmount,
    setEditAmount,
    editCategory,
    setEditCategory,
    editNote,
    setEditNote,
    editDate,
    setEditDate,
    errorMessage,
    resetEditState,
    startEditing,
    saveEdit,
    deleteExpense
  };
}