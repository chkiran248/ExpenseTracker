
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
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetTotal = budgets.reduce((sum, b) => sum + b.amount, 0);
    const monthTotal = expenses
      .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + e.amount, 0);
    
    return [
      { label: 'Total Yearly Spending', value: total, color: 'indigo' },
      { label: 'Monthly Budget Health', value: budgetTotal > 0 ? (monthTotal / budgetTotal) * 100 : 0, isPercent: true, color: 'cyan' },
      { label: 'Current Month Spent', value: monthTotal, color: 'emerald' },
      { label: 'Total Registered Expenses', value: expenses.length, isCount: true, color: 'slate' }
    ];
  }, [expenses, budgets]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {stat.isPercent 
                  ? `${stat.value.toFixed(1)}%` 
                  : stat.isCount 
                    ? stat.value 
                    : `₹${stat.value.toLocaleString('en-IN')}`}
              </p>
            </div>
            {stat.isPercent && (
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${stat.value > 100 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`}
                  style={{ width: `${Math.min(stat.value, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Expense Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Total']} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
