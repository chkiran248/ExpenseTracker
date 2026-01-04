
import React, { useState, useMemo } from 'react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, Icons } from '../constants';

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
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

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
    link.setAttribute('download', `biz_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search audit memo..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc045] font-black text-[#162a0a]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="All">All Departments</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc045] font-black text-[#162a0a]"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
          >
            <option value="All">All Methods</option>
            {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
          <button 
            onClick={exportToCSV}
            className="px-5 py-2.5 text-[#8cc045] font-black text-sm hover:bg-[#8cc045]/10 rounded-xl transition-all border-2 border-[#8cc045]/30 active:scale-95"
          >
            Generate CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#162a0a] uppercase bg-stone-50 border-b border-stone-100">
              <tr>
                <th 
                  className="px-6 py-5 font-black cursor-pointer hover:text-[#8cc045] transition-colors"
                  onClick={() => {
                    if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('date'); setSortOrder('desc'); }
                  }}
                >
                  Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-5 font-black">Dept</th>
                <th className="px-6 py-5 font-black">Memo</th>
                <th 
                  className="px-6 py-5 font-black cursor-pointer hover:text-[#8cc045] transition-colors"
                  onClick={() => {
                    if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('amount'); setSortOrder('desc'); }
                  }}
                >
                  Value {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-5 font-black">Method</th>
                <th className="px-6 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8cc045] font-black italic">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#8cc045]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[#162a0a] font-bold">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-[#8cc045]/10 text-[#8cc045]">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#162a0a]">
                      <div className="flex items-center gap-2">
                        {expense.description}
                        {expense.receiptImage && (
                          <button 
                            onClick={() => setViewingReceipt(expense.receiptImage!)}
                            className="text-[#8cc045] hover:text-[#7aaf38] transition-all"
                            title="View Voucher"
                          >
                            <Icons.Receipt />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-[#162a0a]">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#8cc045] font-bold">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                      <button 
                        onClick={() => onEdit(expense)}
                        className="text-[#c79e1c] hover:text-[#8cc045] font-black transition-colors"
                      >
                        Modify
                      </button>
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="text-stone-400 hover:text-rose-600 font-black transition-colors"
                      >
                        Purge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Receipt Viewer Overlay */}
      {viewingReceipt && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setViewingReceipt(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex flex-col gap-4">
            <div className="flex justify-between items-center text-white shrink-0">
              <h3 className="text-xl font-black uppercase tracking-widest">Document Audit</h3>
              <button 
                onClick={() => setViewingReceipt(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center">
              <img src={viewingReceipt} alt="Full Voucher" className="max-w-full max-h-full object-contain" />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] text-center">MoneyFlow Digital Asset Verification</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
