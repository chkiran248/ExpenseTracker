
import React, { useState, useMemo } from 'react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        const matchesPayment = paymentFilter === 'All' || e.paymentMethod === paymentFilter;
        return matchesSearch && matchesCategory && matchesPayment;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (sortField === 'date') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [expenses, searchTerm, categoryFilter, paymentFilter, sortField, sortOrder]);

  const exportToCSV = () => {
    const headers = ['Date', 'Amount (INR)', 'Category', 'Description', 'Payment Method', 'Tax Deductible'];
    const rows = filteredExpenses.map(e => [
      e.date,
      e.amount,
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.isTaxDeductible ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `biz_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search description..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
          >
            <option value="All">All Payment Methods</option>
            {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 text-indigo-600 font-medium text-sm hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer hover:text-indigo-600"
                  onClick={() => {
                    if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('date'); setSortOrder('desc'); }
                  }}
                >
                  Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer hover:text-indigo-600"
                  onClick={() => {
                    if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('amount'); setSortOrder('desc'); }
                  }}
                >
                  Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No expenses found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                      <button 
                        onClick={() => onEdit(expense)}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
