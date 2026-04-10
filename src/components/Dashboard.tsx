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
              backgroundColor: categoryTotals[category] > 0 ? "#f0f9ff" : "#f9f9f9"
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