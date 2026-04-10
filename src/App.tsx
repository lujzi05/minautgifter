import { AddExpense } from "./components/AddExpense";
import { DeleteExpense } from "./components/DeleteExpense";
import { ExpenseList } from "./components/ExpenseList";

function App() {
  return (
    <div>
      <h1>Expense Tracker</h1>
      <AddExpense />
      <DeleteExpense />
      <ExpenseList />
    </div>
  );
}

export default App;