import { db } from "../db";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Expense, Category } from "../types";
import { CATEGORIES } from "../types";

export function Settings() {
  const navigate = useNavigate();
  const [importStatus, setImportStatus] = useState<string>("");
  const [clearConfirm, setClearConfirm] = useState(false);

  const parseCSV = (csvText: string): Expense[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error("CSV must have header and at least one data row");

    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ["ID", "Amount", "Category", "Date", "Note"];

    if (headers.length !== expectedHeaders.length ||
        !headers.every((h, i) => h === expectedHeaders[i])) {
      throw new Error("CSV headers must be: ID,Amount,Category,Date,Note");
    }

    const expenses: Expense[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing - handle quoted fields
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current);

      if (fields.length !== 5) {
        throw new Error(`Row ${i + 1}: Expected 5 fields, got ${fields.length}`);
      }

      const [id, amountStr, categoryStr, dateStr, noteStr] = fields.map(f => f.trim());

      // Validate ID
      if (!id) throw new Error(`Row ${i + 1}: ID cannot be empty`);

      // Validate Amount
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount < 0) {
        throw new Error(`Row ${i + 1}: Invalid amount "${amountStr}"`);
      }

      // Validate Category
      if (!CATEGORIES.includes(categoryStr as Category)) {
        throw new Error(`Row ${i + 1}: Invalid category "${categoryStr}". Must be one of: ${CATEGORIES.join(', ')}`);
      }

      // Validate Date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Row ${i + 1}: Invalid date "${dateStr}"`);
      }

      // Note is optional
      const note = noteStr || undefined;

      expenses.push({
        id,
        amount,
        category: categoryStr as Category,
        date: date.toISOString(),
        note
      });
    }

    return expenses;
  };

  const importFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus("Reading file...");
      const text = await file.text();

      setImportStatus("Parsing CSV...");
      const expenses = parseCSV(text);

      setImportStatus(`Importing ${expenses.length} expenses...`);
      await db.expenses.bulkAdd(expenses);

      setImportStatus(`✅ Successfully imported ${expenses.length} expenses!`);
    } catch (error) {
      setImportStatus(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset file input
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }

    try {
      setImportStatus("Clearing all data...");
      await db.expenses.clear();
      setImportStatus("✅ All data cleared!");
      setClearConfirm(false);
    } catch (error) {
      setImportStatus(`❌ Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

      {importStatus && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: importStatus.startsWith("✅") ? "#d4edda" : importStatus.startsWith("❌") ? "#f8d7da" : "#fff3cd",
          border: "1px solid #ccc",
          borderRadius: "0.5rem"
        }}>
          {importStatus}
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3>Data Export</h3>
        <p>Export all your expenses to a CSV file for backup or analysis.</p>
        <button onClick={exportToCSV} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Export to CSV
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Data Import</h3>
        <p>Import expenses from a CSV file. The file must have the same structure as exported files.</p>
        <input
          type="file"
          accept=".csv"
          onChange={importFromCSV}
          style={{ marginTop: "1rem" }}
        />
        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
          Expected format: ID,Amount,Category,Date,Note
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Danger Zone</h3>
        <p>Clear all expense data. This action cannot be undone.</p>
        <button
          onClick={clearAllData}
          style={{
            padding: "0.5rem 1rem",
            marginTop: "1rem",
            backgroundColor: clearConfirm ? "#dc3545" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "0.25rem"
          }}
        >
          {clearConfirm ? "Click again to confirm clear all data" : "Clear All Data"}
        </button>
        {clearConfirm && (
          <button
            onClick={() => setClearConfirm(false)}
            style={{
              padding: "0.5rem 1rem",
              marginLeft: "1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "0.25rem"
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/")} style={{ padding: "0.5rem 1rem" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}