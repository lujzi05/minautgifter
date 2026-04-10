import { db } from "../db";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const navigate = useNavigate();

  const exportToCSV = async () => {
    const expenses = await db.expenses.toArray();

    // CSV header
    const headers = ["ID", "Amount", "Category", "Date", "Note"];

    // CSV rows
    const rows = expenses.map(expense => [
      expense.id,
      expense.amount.toString(),
      expense.category,
      new Date(expense.date).toISOString().split('T')[0], // YYYY-MM-DD format
      expense.note ? `"${expense.note.replace(/"/g, '""')}"` : "" // Escape quotes in notes
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Settings</h2>

      <div style={{ marginTop: "2rem" }}>
        <h3>Data Export</h3>
        <p>Export all your expenses to a CSV file for backup or analysis.</p>
        <button onClick={exportToCSV} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Export to CSV
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/")} style={{ padding: "0.5rem 1rem" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}