
import React, { useState } from 'react';
import { Budget, Expense, Category } from '../types';
import { CATEGORIES } from '../constants';

interface BudgetManagerProps {
  budgets: Budget[];
  expenses: Expense[];
  onUpdate: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, expenses, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(budgets);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getSpentForCategory = (cat: Category) => {
    return expenses
      .filter(e => e.category === cat && 
        new Date(e.date).getMonth() === currentMonth && 
        new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSave = () => {
    onUpdate(localBudgets);
    setEditMode(false);
  };

  const handleBudgetChange = (cat: Category, value: string) => {
    const amount = parseFloat(value) || 0;
    setLocalBudgets(prev => prev.map(b => b.category === cat ? { ...b, amount } : b));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Monthly Budgets</h3>
          <p className="text-sm text-slate-500">Compare your actual spending against allocated limits for {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())}.</p>
        </div>
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Manage Limits
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditMode(false); setLocalBudgets(budgets); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {localBudgets.map((budget) => {
          const spent = getSpentForCategory(budget.category);
          const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOver = spent > budget.amount;

          return (
            <div key={budget.category} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-slate-800">{budget.category}</h4>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">₹</span>
                    <input 
                      type="number"
                      className="w-24 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={budget.amount}
                      onChange={(e) => handleBudgetChange(budget.category, e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Limit</p>
                    <p className="font-bold text-slate-900">₹{budget.amount.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className={isOver ? 'text-rose-600' : 'text-slate-500'}>
                    Spent: ₹{spent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400">
                    {percent.toFixed(0)}% used
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {isOver && (
                  <p className="text-xs text-rose-500 font-medium">
                    Exceeded by ₹{(spent - budget.amount).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;
