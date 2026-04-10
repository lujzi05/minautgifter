import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AddExpense } from "./components/AddExpense";
import { Dashboard } from "./components/Dashboard";
import { Insights } from "./components/Insights";
import { Settings } from "./components/Settings";
import { BottomTabs } from "./components/BottomTabs";

function App() {
  return (
    <Router>
      <div style={{ paddingBottom: "4rem" }}> {/* Space for bottom tabs */}
        <h1>Expense Tracker</h1>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add/:category" element={<AddExpense />} />
        </Routes>
        <BottomTabs />
      </div>
    </Router>
  );
}

export default App;