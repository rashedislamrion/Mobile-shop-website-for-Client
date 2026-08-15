"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Calculator, CheckCircle2, AlertCircle, ChevronRight, Download, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RunPayrollPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [month, setMonth] = useState("2026-09");

  useEffect(() => {
    setTitle("Run Payroll");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 2000);
  };

  const handleApprove = () => {
    toast.success("Payroll approved and payslips generated successfully!");
    router.push("/admin/hrm/payroll");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 -z-10" style={{ width: step === 1 ? '0%' : '100%' }} />
        
        <div className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-100'}`}>
            1
          </div>
          <span className="text-sm font-semibold">Configuration</span>
        </div>
        
        <div className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-100'}`}>
            2
          </div>
          <span className="text-sm font-semibold">Review & Approve</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Configure Payroll Run</h2>
            <p className="text-slate-500 mt-1">Select the month and branch to generate salary slips for.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Salary Month</label>
              <input 
                type="month" 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Branch</label>
              <select className="w-full h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow">
                <option value="all">All Branches (Global)</option>
                <option value="dhaka">Dhaka Main Branch</option>
                <option value="ctg">Chattogram Branch</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Pre-run Checklist:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Ensure all employee attendance records are finalized.</li>
                <li>Verify any bonus or deduction adjustments for this month.</li>
                <li>New employees joined this month will have prorated salaries.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={() => router.push('/admin/hrm/payroll')}
              className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleRun}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" /> Generate Payroll
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  Payroll Generated Successfully
                </h2>
                <p className="text-slate-500 mt-1">Review the summary before final approval.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium">Month</p>
                <p className="text-lg font-bold text-slate-800">September 2026</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">42</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Basic Salary Total</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">৳1,245,000</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 mt-1">৳12,500</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">Net Payable Total</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">৳1,328,500</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Department</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">Employees</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Management</td>
                    <td className="px-4 py-3 text-slate-600 text-right">4</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 text-right">৳280,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Sales</td>
                    <td className="px-4 py-3 text-slate-600 text-right">18</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 text-right">৳450,500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Technical/Repair</td>
                    <td className="px-4 py-3 text-slate-600 text-right">12</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 text-right">৳425,000</td>
                  </tr>
                  <tr className="bg-slate-50/50 font-bold">
                    <td className="px-4 py-3 text-slate-800">Total</td>
                    <td className="px-4 py-3 text-slate-800 text-right">42</td>
                    <td className="px-4 py-3 text-slate-800 text-right">৳1,328,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Back to Configuration
              </button>
              <div className="flex gap-3">
                <button 
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Draft (CSV)
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" /> Approve & Finalize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
