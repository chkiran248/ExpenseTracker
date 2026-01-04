
import React, { useState } from 'react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';

interface ExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  initialData?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || PAYMENT_METHODS[0],
    isTaxDeductible: initialData?.isTaxDeductible || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.description) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        category: formData.category as Category,
        paymentMethod: formData.paymentMethod as PaymentMethod
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Expense' : 'Log New Expense'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input 
                type="date"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.date ? 'border-rose-300 ring-rose-100' : 'border-slate-200'}`}
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
              {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Amount (₹)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.amount ? 'border-rose-300 ring-rose-100' : 'border-slate-200'}`}
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <input 
              type="text"
              placeholder="e.g. Monthly office rent"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.description ? 'border-rose-300 ring-rose-100' : 'border-slate-200'}`}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Payment Method</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
              >
                {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="isTaxDeductible"
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              checked={formData.isTaxDeductible}
              onChange={(e) => setFormData(prev => ({ ...prev, isTaxDeductible: e.target.checked }))}
            />
            <label htmlFor="isTaxDeductible" className="text-sm text-slate-600 select-none cursor-pointer">
              Tag as tax deductible business expense
            </label>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
            >
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
