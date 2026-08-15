"use client";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export function ReportExportButtons() {
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => toast.success("Exporting CSV...")}
        className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
      >
        <Download className="w-4 h-4" /> Export CSV
      </button>
      <button 
        onClick={() => toast.success("Exporting PDF...")}
        className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
      >
        <FileText className="w-4 h-4" /> Export PDF
      </button>
    </div>
  );
}
