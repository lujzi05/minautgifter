import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { CATEGORIES, type Category } from "../types";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const expenses = useLiveQuery(() => db.expenses.toArray(), []);
  const navigate = useNavigate();

  const categoryTotals = expenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<Category, number>) || {};

  const handleCategoryClick = (category: Category) => {
    navigate(`/add/${category}`);
  };

  return (
    <div>
      <h2>Dashboard</h2>
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
              textAlign: "center"
            }}
          >
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <p>{(categoryTotals[category] || 0).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}