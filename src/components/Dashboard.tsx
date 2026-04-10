import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { CATEGORIES, type Category } from "../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Dashboard() {
  const expenses = useLiveQuery(() => db.expenses.toArray(), []);
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredExpenses = expenses?.filter((e) => {
    const expenseMonth = e.date.slice(0, 7);
    return expenseMonth === selectedMonth;
  });

  const categoryTotals = filteredExpenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<Category, number>)) || CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<Category, number>);

  const categoryHasExpenses = filteredExpenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<Category, number>)) || CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<Category, number>);

  const categoryColors: Record<Category, string> = {
    food: "#10b981", // emerald-500
    restaurant: "#f59e0b", // amber-500
    transport: "#3b82f6", // blue-500
    health: "#ef4444", // red-500
    essentials: "#8b5cf6", // violet-500
    general: "#6b7280" // gray-500
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/add/${category}`);
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Month:
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
        {CATEGORIES.map((category) => (
          <div
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: categoryHasExpenses[category] > 0 ? categoryColors[category] : "#f9f9f9",
              color: categoryHasExpenses[category] > 0 ? "#ffffff" : "#000000"
            }}
          >
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {categoryTotals[category]?.toFixed(2) || "0.00"}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center", color: "#666" }}>
        <p>Total for {selectedMonth}: <strong>{Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0).toFixed(2)}</strong></p>
      </div>
    </div>
  );
}