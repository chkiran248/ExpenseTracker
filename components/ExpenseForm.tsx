
import React, { useState, useRef } from 'react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, Icons } from '../constants';

interface ExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  initialData?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSubmit, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || PAYMENT_METHODS[0],
    isTaxDeductible: initialData?.isTaxDeductible || false,
    receiptImage: initialData?.receiptImage || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount required';
    if (!formData.description) newErrors.description = 'Memo required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size check (2MB limit for localStorage safety)
      if (file.size > 2 * 1024 * 1024) {
        alert("Institutional Limit: File exceeds 2MB threshold. Please optimize the image for local storage.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#162a0a]/60 backdrop-blur-xl">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#8cc045]/20 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-[#8cc045]/5 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-[#162a0a] leading-tight">
              {initialData ? 'Audit Update' : 'Asset Posting'}
            </h3>
            <p className="text-xs font-black text-[#8cc045] uppercase tracking-widest mt-1">Institutional Ledger Tool</p>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-[#162a0a] transition-colors p-2 hover:bg-white rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Posting Date</label>
              <input 
                type="date"
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all font-bold text-[#162a0a]"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Asset Value (₹)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all font-black text-[#162a0a]"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Transaction Memo</label>
            <input 
              type="text"
              placeholder="Detailed descriptor..."
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all font-bold text-[#162a0a]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Department</label>
              <select 
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all font-black text-[#162a0a]"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Medium</label>
              <select 
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cc045] transition-all font-black text-[#162a0a]"
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
              >
                {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#162a0a] uppercase tracking-widest ml-1">Voucher Attachment</label>
            <div className="flex flex-col gap-3">
              {formData.receiptImage ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-[#8cc045] aspect-video bg-stone-50">
                  <img src={formData.receiptImage} alt="Receipt preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, receiptImage: undefined }))}
                      className="px-4 py-2 bg-rose-600 text-white font-black text-xs rounded-xl shadow-lg hover:bg-rose-700 transition-all"
                    >
                      Remove
                    </button>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#8cc045] text-white font-black text-xs rounded-xl shadow-lg hover:bg-[#7aaf38] transition-all"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#8cc045] hover:bg-[#8cc045]/5 transition-all text-stone-400 hover:text-[#8cc045]"
                >
                  <Icons.Receipt />
                  <span className="text-[10px] font-black uppercase tracking-widest">Attach Digital Voucher</span>
                </button>
              )}
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 px-1">
            <input 
              type="checkbox"
              id="isTaxDeductible"
              className="w-6 h-6 text-[#8cc045] rounded-lg focus:ring-[#8cc045] border-stone-200 cursor-pointer"
              checked={formData.isTaxDeductible}
              onChange={(e) => setFormData(prev => ({ ...prev, isTaxDeductible: e.target.checked }))}
            />
            <label htmlFor="isTaxDeductible" className="text-sm font-black text-[#162a0a] select-none cursor-pointer">
              Tag as tax-deductible commercial asset
            </label>
          </div>

          <div className="pt-4 flex gap-4 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 font-black rounded-2xl transition-all active:scale-95"
            >
              Abort
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-4 bg-[#8cc045] hover:bg-[#7aaf38] text-white font-black rounded-2xl transition-all shadow-xl shadow-[#8cc045]/20 active:scale-95"
            >
              {initialData ? 'Confirm Modify' : 'Finalize Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
