"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { UploadCloud, DownloadCloud, AlertTriangle, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

export default function BulkImportExportPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setTitle("Bulk Import & Export");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      setShowPreview(false);
      
      // Simulate file reading delay
      setTimeout(() => {
        setIsImporting(false);
        setShowPreview(true);
        toast.success("File parsed successfully. Please review below.");
      }, 1500);
    }
  };

  const handleConfirmImport = () => {
    toast.success("Products imported successfully!");
    setShowPreview(false);
  };

  const handleExport = (format: "csv" | "xlsx") => {
    toast.success(`Exporting as ${format.toUpperCase()} started...`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN: Import Products */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-slate-500" />
              Import Products
            </h3>
            <button className="text-emerald-600 hover:underline text-sm font-medium transition-all">
              Download Sample Template
            </button>
          </div>
          
          <div className="p-6">
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl p-10 text-center transition-colors relative cursor-pointer hover:bg-emerald-50">
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  {isImporting ? (
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-lg">Click or drag CSV/Excel file here</p>
                  <p className="text-sm text-slate-500 mt-1">Make sure it matches the sample template format</p>
                </div>
              </div>
            </div>

            {showPreview && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Validation Errors Callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">Found 2 issues in 340 rows</h4>
                    <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                      <li>Row 12: Missing SKU</li>
                      <li>Row 45: Price must be a positive number</li>
                    </ul>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview (First 3 Rows)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Name</th>
                          <th className="px-4 py-2 font-medium">SKU</th>
                          <th className="px-4 py-2 font-medium">Category</th>
                          <th className="px-4 py-2 font-medium text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="px-4 py-2">iPhone 13 Pro Max Display</td>
                          <td className="px-4 py-2">IP13PM-DIS</td>
                          <td className="px-4 py-2">Display</td>
                          <td className="px-4 py-2 text-right">15500</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Samsung S22 Battery</td>
                          <td className="px-4 py-2">S22-BAT</td>
                          <td className="px-4 py-2">Battery</td>
                          <td className="px-4 py-2 text-right">4200</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Poco X3 Pro Motherboard</td>
                          <td className="px-4 py-2">POCOX3P-MB</td>
                          <td className="px-4 py-2">Motherboard</td>
                          <td className="px-4 py-2 text-right">12000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={handleConfirmImport} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto">
                    Confirm & Import 340 Products
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Export Products */}
      <div className="w-full lg:w-1/2">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <DownloadCloud className="w-5 h-5 text-slate-500" />
              Export Products
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Category</label>
              <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option value="all">All Categories</option>
                <option value="display">Display</option>
                <option value="battery">Battery</option>
                <option value="charging-logic">Charging Logic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Brand</label>
              <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option value="all">All Brands</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                <option value="xiaomi">Xiaomi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Status</label>
              <select className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option value="all">Any Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleExport("csv")} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm">
                <FileText className="w-4 h-4" /> Export as CSV
              </button>
              <button onClick={() => handleExport("xlsx")} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
                <FileSpreadsheet className="w-4 h-4" /> Export as XLSX
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
