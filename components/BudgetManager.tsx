
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
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#162a0a]">Threshold Management</h3>
          <p className="text-sm text-[#8cc045] font-black">Capital health for {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())}.</p>
        </div>
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            className="px-5 py-2.5 bg-[#162a0a] text-stone-100 rounded-xl hover:bg-[#1d2d0f] transition-all font-black shadow-md active:scale-95"
          >
            Modify Limits
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => { setEditMode(false); setLocalBudgets(budgets); }}
              className="px-5 py-2.5 text-[#162a0a] hover:bg-stone-50 rounded-xl transition-all font-black"
            >
              Abort
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#c79e1c] text-[#162a0a] rounded-xl hover:bg-[#ab8818] transition-all font-black shadow-md active:scale-95"
            >
              Confirm Update
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
            <div key={budget.category} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#8cc045]/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-black text-[#162a0a]">{budget.category}</h4>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#8cc045]">₹</span>
                    <input 
                      type="number"
                      className="w-24 px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8cc045] text-sm font-black text-[#162a0a]"
                      value={budget.amount}
                      onChange={(e) => handleBudgetChange(budget.category, e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-xs font-black text-[#8cc045] uppercase tracking-tighter">Limit</p>
                    <p className="font-black text-[#162a0a] text-lg">₹{budget.amount.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black">
                  <span className={isOver ? 'text-[#c79e1c]' : 'text-[#8cc045]'}>
                    Disbursed: ₹{spent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-stone-400 uppercase tracking-widest">
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-stone-50 rounded-full h-3.5 overflow-hidden border border-stone-100">
                  <div 
                    className={`h-full transition-all duration-1000`}
                    style={{ 
                      width: `${Math.min(percent, 100)}%`, 
                      backgroundColor: isOver ? '#c79e1c' : '#8cc045' 
                    }}
                  />
                </div>
                {isOver && (
                  <p className="text-xs text-[#c79e1c] font-black italic">
                    ⚠️ Variance Overrun: ₹{(spent - budget.amount).toLocaleString('en-IN')}
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
