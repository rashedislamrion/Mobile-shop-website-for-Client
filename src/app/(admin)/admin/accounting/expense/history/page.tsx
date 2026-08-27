"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { apiGet } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpenseCategoryItem {
  id: string;
  name: string;
  thisMonthSpend: number;
}

interface ExpenseItem {
  id: string;
  referenceNo: string;
  amount: number | string;
  description: string;
  date: string;
  status: string;
  category?: { id: string; name: string };
  branch?: { id: string; name: string } | null;
  walletType?: { id: string; name: string } | null;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

export default function ExpenseHistoryPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTitle("Expense History");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiGet<ExpenseCategoryItem[]>("/expense-categories"),
      apiGet<{ data: ExpenseItem[] }>("/expenses", { status: "PAID", limit: 100 }),
    ])
      .then(([catRes, expRes]) => {
        if (Array.isArray(catRes)) setCategories(catRes);
        if (expRes?.data) setExpenses(expRes.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const categoryTotals = categories
    .map((cat) => ({
      name: cat.name,
      value: Number(cat.thisMonthSpend || 0),
    }))
    .filter((c) => c.value > 0);

  const filteredExpenses = selectedCategoryName
    ? expenses.filter((e) => e.category?.name === selectedCategoryName)
    : expenses;

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (isLoading) {
    return (
      <div className="flex gap-6 items-start">
        <div className="w-1/3 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="w-2/3">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* LEFT COLUMN: Categories & Chart */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Expense Categories</h3>
          
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategoryName(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategoryName === null ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>All Categories</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{expenses.length}</span>
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryName(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategoryName === cat.name ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${
                  selectedCategoryName === cat.name ? "border-emerald-200 bg-white text-emerald-700 font-bold" : "border-slate-200 bg-slate-50 text-slate-600"
                }`}>
                  ৳{Number(cat.thisMonthSpend || 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Live Expense Distribution</h3>
          <div className="h-[250px]">
            {categoryTotals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense distribution recorded yet
              </div>
            ) : (
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
                    formatter={(value: number) => `৳${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Expense Details list */}
      <div className="w-full lg:w-2/3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {selectedCategoryName ? `${selectedCategoryName} Disbursements` : "All Paid Expenses"}
            </h3>
            <p className="text-xs text-slate-400">Historical records of completed settlements</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Filtered Spend</p>
            <p className="text-2xl font-bold text-rose-600">৳{totalExpense.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl text-sm">
              No paid expenses found for this selection.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-start p-4 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{expense.description}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {expense.referenceNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{new Date(expense.date).toLocaleDateString("en-GB")}</span>
                    <span>•</span>
                    <span>{expense.branch?.name || "Headquarters"}</span>
                    <span>•</span>
                    <span>Paid via: <strong className="text-slate-700">{expense.walletType?.name || "Direct Cash"}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 text-base">৳{Number(expense.amount).toLocaleString()}</div>
                  <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                    PAID
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
