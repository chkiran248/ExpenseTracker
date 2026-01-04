
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Budget, ViewType, Category } from './types';
import { Icons, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetManager from './components/BudgetManager';
import ExpenseForm from './components/ExpenseForm';

const STORAGE_KEY_EXPENSES = 'biz_expenses_data';
const STORAGE_KEY_BUDGETS = 'biz_budgets_data';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load data
  useEffect(() => {
    const savedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const savedBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
    
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Default budgets
      const initialBudgets = CATEGORIES.map(cat => ({ category: cat, amount: 1000 }));
      setBudgets(initialBudgets);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? { ...expenseData, id: exp.id } : exp));
      setEditingExpense(null);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
      };
      setExpenses(prev => [newExpense, ...prev]);
    }
    setIsFormOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleUpdateBudget = (updatedBudgets: Budget[]) => {
    setBudgets(updatedBudgets);
  };

  const totalSpent = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.amount, 0), 
  [expenses]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#162a0a] text-stone-100 flex-shrink-0 shadow-2xl z-30">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 bg-[#c79e1c] rounded-lg text-[#162a0a]">
              <Icons.Budgets />
            </span>
            BizExpense Pro
          </h1>
        </div>
        <nav className="mt-4 px-3 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${view === 'dashboard' ? 'bg-[#c79e1c] text-[#162a0a] shadow-lg shadow-[#c79e1c]/20' : 'text-stone-300 hover:text-white hover:bg-[#8cc045]/10'}`}
          >
            <Icons.Dashboard /> Dashboard
          </button>
          <button 
            onClick={() => setView('expenses')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${view === 'expenses' ? 'bg-[#c79e1c] text-[#162a0a] shadow-lg shadow-[#c79e1c]/20' : 'text-stone-300 hover:text-white hover:bg-[#8cc045]/10'}`}
          >
            <Icons.Expenses /> Expenses
          </button>
          <button 
            onClick={() => setView('budgets')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${view === 'budgets' ? 'bg-[#c79e1c] text-[#162a0a] shadow-lg shadow-[#c79e1c]/20' : 'text-stone-300 hover:text-white hover:bg-[#8cc045]/10'}`}
          >
            <Icons.Budgets /> Budgets
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#8cc045]/20 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#162a0a] capitalize">{view} Overview</h2>
            <p className="text-xs text-[#8cc045] font-bold">Premium Financial Asset Tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-4">
              <p className="text-xs text-[#8cc045] font-bold">Total Disbursed</p>
              <p className="text-lg font-black text-[#162a0a]">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <button 
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 bg-[#8cc045] hover:bg-[#7aaf38] text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Icons.Plus /> <span>New Record</span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard expenses={expenses} budgets={budgets} />}
          {view === 'expenses' && (
            <ExpenseList 
              expenses={expenses} 
              onDelete={handleDeleteExpense} 
              onEdit={handleEditExpense} 
            />
          )}
          {view === 'budgets' && (
            <BudgetManager 
              budgets={budgets} 
              expenses={expenses} 
              onUpdate={handleUpdateBudget} 
            />
          )}
        </div>
      </main>

      {/* Expense Modal */}
      {isFormOpen && (
        <ExpenseForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddExpense} 
          initialData={editingExpense || undefined}
        />
      )}
    </div>
  );
};

export default App;
