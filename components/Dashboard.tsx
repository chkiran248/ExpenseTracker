
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Expense, Budget, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, budgets }) => {
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    })).filter(d => d.value > 0);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, idx) => {
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      });
      return {
        name: month,
        amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      };
    });
  }, [expenses]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleString('default', { month: 'short' }).toUpperCase();

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetTotal = budgets.reduce((sum, b) => sum + b.amount, 0);
    
    const monthTotal = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    return [
      { 
        label: 'Monthly Record', 
        value: monthTotal, 
        color: '#8cc045',
        description: 'Aggregate expenditure for the current calendar month.',
        tag: `${monthName} ${currentYear}`
      },
      { 
        label: 'Annual Disbursement', 
        value: total, 
        color: '#8cc045',
        description: 'Total gross spending across all categories for the current fiscal year.' 
      },
      { 
        label: 'Transaction Audit', 
        value: expenses.length, 
        isCount: true, 
        color: '#8cc045',
        description: 'Total count of individual expense entries and ledger items processed.'
      },
      { 
        label: 'Budget Utilization', 
        value: budgetTotal > 0 ? (monthTotal / budgetTotal) * 100 : 0, 
        isPercent: true, 
        color: '#c79e1c',
        description: 'Percentage of the current month\'s total budget that has been consumed.'
      }
    ];
  }, [expenses, budgets]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#8cc045]/30 transition-all group relative">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs font-black text-[#8cc045] uppercase tracking-widest">{stat.label}</p>
              
              {/* Tooltip Icon - Positioned next to label */}
              <div className="relative group/tip flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-stone-300 cursor-help hover:text-[#8cc045] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#162a0a] text-white text-[10px] rounded-xl opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 shadow-xl font-bold">
                  {stat.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#162a0a]"></div>
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl font-black text-[#162a0a]">
                {stat.isPercent 
                  ? `${stat.value.toFixed(1)}%` 
                  : stat.isCount 
                    ? stat.value 
                    : `₹${stat.value.toLocaleString('en-IN')}`}
              </p>
              {stat.tag && (
                <span className="px-2 py-0.5 bg-[#8cc045]/10 text-[#8cc045] text-[10px] font-black rounded-md border border-[#8cc045]/20">
                  {stat.tag}
                </span>
              )}
            </div>
            
            {stat.isPercent && (
              <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000`}
                  style={{ width: `${Math.min(stat.value, 100)}%`, backgroundColor: stat.value > 100 ? '#c79e1c' : '#8cc045' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-black text-[#162a0a] mb-6">Capital Flow Timeline</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#162a0a" fontSize={11} fontWeight={900} tickLine={false} axisLine={false} />
                <YAxis stroke="#162a0a" fontSize={11} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#8cc045" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-black text-[#162a0a] mb-6">Asset Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Total']} 
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
