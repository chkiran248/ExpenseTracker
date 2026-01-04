
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
      { label: 'Annual Disbursement', value: total, color: '#8cc045' },
      { label: 'Budget Utilization', value: budgetTotal > 0 ? (monthTotal / budgetTotal) * 100 : 0, isPercent: true, color: '#c79e1c' },
      { label: 'Monthly Record', value: monthTotal, color: '#8cc045' },
      { label: 'Transaction Audit', value: expenses.length, isCount: true, color: '#8cc045' }
    ];
  }, [expenses, budgets]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#8cc045]/30 transition-all group">
            <p className="text-xs font-black text-[#8cc045] uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#162a0a]">
                {stat.isPercent 
                  ? `${stat.value.toFixed(1)}%` 
                  : stat.isCount 
                    ? stat.value 
                    : `₹${stat.value.toLocaleString('en-IN')}`}
              </p>
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
