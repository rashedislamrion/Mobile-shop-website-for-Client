"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { mockExpenses } from "@/lib/mock-data/accounting/expenses";
import { mockExpenseCategories } from "@/lib/mock-data/accounting/expense-categories";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ExpenseHistoryPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Expense History");
    setBadge("Accounting");
    setDateFilter("This Month"); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute category totals for the pie chart
  const categoryTotals = mockExpenseCategories.map(cat => {
    const total = mockExpenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, value: total };
  }).filter(c => c.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const filteredExpenses = selectedCategory 
    ? mockExpenses.filter(e => e.category === selectedCategory) 
    : mockExpenses;

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex gap-6 items-start">
      
      {/* LEFT COLUMN: Categories & Filters */}
      <div className="w-1/3 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Expense Categories</h3>
          
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === null ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>All Categories</span>
            </button>
            
            {mockExpenseCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.name ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs bg-white border ${
                  selectedCategory === cat.name ? "border-emerald-200 text-emerald-700" : "border-slate-200"
                }`}>
                  ৳{cat.thisMonthSpend.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Expense Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `৳${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Expense Details list */}
      <div className="w-2/3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-slate-800 text-lg">
            {selectedCategory ? `${selectedCategory} Expenses` : "All Expenses Overview"}
          </h3>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Spend</p>
            <p className="text-2xl font-bold text-rose-600">৳{totalExpense.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl">
              No expenses recorded for this category yet.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-start p-4 border border-slate-100 rounded-xl hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{expense.description}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {expense.referenceNo}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <span>{expense.date}</span>
                    <span>•</span>
                    <span>{expense.branch}</span>
                    <span>•</span>
                    <span>Paid via: {expense.paidVia}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">৳{expense.amount.toLocaleString()}</div>
                  <div className={`text-xs font-medium mt-1 ${expense.status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                    {expense.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
