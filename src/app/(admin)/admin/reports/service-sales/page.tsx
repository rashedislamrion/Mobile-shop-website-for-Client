"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useStaffAuth } from "@/context/AuthContext";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  Search,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieChartIcon
} from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { exportToCsv } from "@/lib/export-utils";

export default function ServiceSalesReportPage() {
  const { setTitle, setBadge } = useAdminPage();
  const { user } = useStaffAuth();

  const roleName = user?.role?.name?.toLowerCase() || "";
  const isTechnician = roleName.includes("technician");

  // Active Tab
  const [activeTab, setActiveTab] = useState(isTechnician ? "technician-view" : "global-report");

  // Filters State
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Data States
  const [isLoading, setIsLoading] = useState(true);
  const [globalReport, setGlobalReport] = useState<any>(null);
  const [technicianReport, setTechnicianReport] = useState<any>(null);
  const [techPerformance, setTechPerformance] = useState<any[]>([]);
  const [shopwiseReport, setShopwiseReport] = useState<any>(null);
  const [marketingFeeReport, setMarketingFeeReport] = useState<any>(null);

  // Expandable rows state for Global Report
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  useEffect(() => {
    setTitle(isTechnician ? "My Servicing Report" : "Service & Servicing Report");
    setBadge("Financial Reporting");
  }, [setTitle, setBadge, isTechnician]);

  // Load All Reports
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (technicianSearch.trim()) params.search = technicianSearch.trim();

      // 1. Global Service Report
      const globalPromise = apiGet<any>("/reports/service-global", params).catch(() => null);

      // 2. Technician Servicing Report (Current User or selected)
      const techPromise = apiGet<any>("/reports/servicing-technician", params).catch(() => null);

      // 3. Technician Performance
      const perfPromise = apiGet<any>("/reports/technician-performance", params).catch(() => []);

      // 4. Shopwise Report
      const shopPromise = apiGet<any>("/reports/shopwise", params).catch(() => null);

      // 5. Marketing Fee Report
      const mktPromise = apiGet<any>("/reports/marketing-fee", params).catch(() => null);

      const [globalRes, techRes, perfRes, shopRes, mktRes] = await Promise.all([
        globalPromise,
        techPromise,
        perfPromise,
        shopPromise,
        mktPromise,
      ]);

      if (globalRes) setGlobalReport(globalRes);
      if (techRes) setTechnicianReport(techRes);
      if (Array.isArray(perfRes)) setTechPerformance(perfRes);
      if (shopRes) setShopwiseReport(shopRes);
      if (mktRes) setMarketingFeeReport(mktRes);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, technicianSearch]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filtered Technicians in Global Report
  const filteredTechnicians = useMemo(() => {
    if (!globalReport?.technicians) return [];
    if (!technicianSearch.trim()) return globalReport.technicians;
    const q = technicianSearch.toLowerCase();
    return globalReport.technicians.filter(
      (t: any) =>
        t.name?.toLowerCase().includes(q) ||
        t.employeeId?.toLowerCase().includes(q) ||
        t.branch?.name?.toLowerCase().includes(q)
    );
  }, [globalReport, technicianSearch]);

  // Export handlers
  const handleExportGlobal = () => {
    if (!globalReport?.technicians?.length) {
      toast.info("No technician data to export.");
      return;
    }
    const filename = `global_service_report_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = ["Technician", "Employee ID", "Branch", "Services Count", "Collection", "Material Cost", "Gross Profit", "Profit Share %", "Technician Share"];
    const rows = globalReport.technicians.map((t: any) => [
      t.name,
      t.employeeId || "N/A",
      t.branch?.name || "Global",
      t.servicesCount,
      t.collection,
      t.materialCost,
      t.profit,
      `${t.profitSharePercentage}%`,
      t.profitShare,
    ]);
    exportToCsv(filename, headers, rows);
    toast.success("Global service report exported successfully.");
  };

  const handleExportTechnician = () => {
    if (!technicianReport?.details?.length) {
      toast.info("No servicing records to export.");
      return;
    }
    const filename = `my_servicing_report_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = ["Invoice No", "Date", "Device", "Problems", "Total Cost", "Material Cost", "Labor Profit", "Status"];
    const rows = technicianReport.details.map((j: any) => [
      j.invoiceNo || j.order?.orderCode || "N/A",
      new Date(j.createdAt).toLocaleDateString("en-GB"),
      j.device,
      j.problems ? JSON.stringify(j.problems) : "N/A",
      j.totalCost,
      j.materialCost,
      j.profit,
      j.status,
    ]);
    exportToCsv(filename, headers, rows);
    toast.success("Servicing details exported successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Fix Pass 21 Real Data
            </span>
            <span className="text-xs text-slate-400 font-mono">Service Job & Ledger Aggregations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Servicing & Repair Financial Reports</h1>
          <p className="text-xs text-slate-500">
            Database-backed reporting for gross profit, owner profit, technician commission, and shopwise servicing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs border-slate-300 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === "technician-view" ? handleExportTechnician : handleExportGlobal}
            className="text-xs border-slate-300 flex items-center gap-1.5 text-emerald-700 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={loadReports}
            disabled={isLoading}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Generate
          </Button>
        </div>
      </div>

      {/* Date & Filter Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end print:hidden">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">From Date</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">To Date</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Search Technician</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Filter by name / ID..."
              value={technicianSearch}
              onChange={(e) => setTechnicianSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setTechnicianSearch("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 h-8"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Tabbed Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-200/80 p-1 rounded-xl">
          {!isTechnician && (
            <TabsTrigger value="global-report" className="text-xs font-bold data-[state=active]:bg-white">
              Global Service Report (Admin)
            </TabsTrigger>
          )}
          <TabsTrigger value="technician-view" className="text-xs font-bold data-[state=active]:bg-white">
            Servicing Report (Technician View)
          </TabsTrigger>
          {!isTechnician && (
            <>
              <TabsTrigger value="performance-view" className="text-xs font-bold data-[state=active]:bg-white">
                Technician Performance & Profit
              </TabsTrigger>
              <TabsTrigger value="shopwise-view" className="text-xs font-bold data-[state=active]:bg-white">
                Shopwise & Marketing Fee
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* TAB 1: Global Service Report (Admin / Owner View) */}
        {!isTechnician && (
          <TabsContent value="global-report" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Gross Profit (Labor Margin)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
                    ৳{Number(globalReport?.summary?.grossProfit || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Total revenue minus material costs</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs bg-gradient-to-br from-white to-blue-50/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Owner Profit (Retained)</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-700 mt-2">
                    ৳{Number(globalReport?.summary?.ownerProfit || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Gross profit after technician share</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Material Cost</span>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-2">
                    ৳{Number(globalReport?.summary?.totalMaterialCost || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Spare parts and hardware sourced</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Completed Services</span>
                    <Wrench className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-700 mt-2">
                    {Number(globalReport?.summary?.totalServices || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Delivered & ready servicing jobs</div>
                </CardContent>
              </Card>
            </div>

            {/* Collection Methods Breakdown */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-800">Collection Methods Breakdown</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Real payment settlements recorded across all service jobs in the selected range
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {globalReport?.collectionMethods?.map((cm: any) => (
                    <div
                      key={cm.method}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-center"
                    >
                      <div className="text-xs font-semibold text-slate-500 uppercase">{cm.method}</div>
                      <div className="text-base font-bold font-mono text-slate-800 mt-1">
                        ৳{Number(cm.amount || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{cm.count || 0} txn(s)</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technician Service Report Expandable List */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Technician Service Report (Aggregated per Staff)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Click any row to expand profit sharing detail and service breakdown
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 font-normal">
                  {filteredTechnicians.length} Technicians
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Technician</th>
                        <th className="py-2.5 px-3 font-semibold">Branch</th>
                        <th className="py-2.5 px-3 font-semibold text-center"># Services</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Collection (৳)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Material (৳)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Profit (৳)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTechnicians.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-400">
                            No technician service records found in this range.
                          </td>
                        </tr>
                      ) : (
                        filteredTechnicians.map((t: any) => {
                          const isExpanded = expandedTechId === t.id;
                          return (
                            <>
                              <tr
                                key={t.id}
                                onClick={() => setExpandedTechId(isExpanded ? null : t.id)}
                                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                              >
                                <td className="py-3 px-3 font-semibold text-slate-800">
                                  {t.name}
                                  {t.employeeId && (
                                    <span className="ml-1.5 text-[10px] text-slate-400 font-mono font-normal">
                                      ({t.employeeId})
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-slate-600">{t.branch?.name || "Global"}</td>
                                <td className="py-3 px-3 text-center font-bold text-slate-800">
                                  {t.servicesCount}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                  ৳{Number(t.collection || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-600">
                                  ৳{Number(t.materialCost || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                                  ৳{Number(t.profit || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </Button>
                                </td>
                              </tr>

                              {/* Expanded Row: Section 1.3 Profit Sharing Details */}
                              {isExpanded && (
                                <tr className="bg-emerald-50/30">
                                  <td colSpan={7} className="p-4 border-t border-b border-emerald-100">
                                    <div className="bg-white rounded-lg p-4 border border-emerald-200/80 space-y-3 shadow-xs">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-emerald-600" />
                                          <span className="font-bold text-xs text-slate-800">
                                            Technician Profit Sharing Breakdown: {t.name}
                                          </span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                                          Rate: {t.profitSharePercentage}%
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-2.5 rounded bg-slate-50">
                                          <span className="text-slate-500 block">Gross Service Value</span>
                                          <span className="font-mono font-bold text-slate-800 text-sm">
                                            ৳{Number(t.collection || 0).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="p-2.5 rounded bg-slate-50">
                                          <span className="text-slate-500 block">Less Parts Material Cost</span>
                                          <span className="font-mono font-bold text-rose-600 text-sm">
                                            -৳{Number(t.materialCost || 0).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="p-2.5 rounded bg-slate-50">
                                          <span className="text-slate-500 block">Labor Margin Subject to Share</span>
                                          <span className="font-mono font-bold text-emerald-700 text-sm">
                                            ৳{Number(t.profit || 0).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200">
                                          <span className="text-emerald-800 font-semibold block">
                                            Technician Profit Share ({t.profitSharePercentage}%)
                                          </span>
                                          <span className="font-mono font-bold text-emerald-900 text-sm">
                                            ৳{Number(t.profitShare || 0).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>

                                      <p className="text-[11px] text-slate-400">
                                        Formula: <code className="font-mono text-slate-600">profitSharePercentage × (Final Amount − Material Cost)</code>. Rollable directly into HRM Payroll commissions.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 2: Servicing Report (Per-Technician View) */}
        <TabsContent value="technician-view" className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  Technician Servicing Ledger
                </Badge>
                <span className="text-xs text-slate-300 font-mono">
                  {technicianReport?.dateRange?.from} - {technicianReport?.dateRange?.to}
                </span>
              </div>
              <h2 className="text-xl font-bold">
                {technicianReport?.technician?.name || user?.name || "Technician Workspace"}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Branch: <span className="font-semibold text-white">{technicianReport?.technician?.branch?.name || "Dhaka Main"}</span> | Profit Share Rate: <span className="font-semibold text-emerald-300">{technicianReport?.technician?.profitSharePercentage || 0}%</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-right">
                <span className="text-[11px] text-slate-300 block">My Earned Share</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ৳{Number(technicianReport?.technicianShare || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards: Material Cost & Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Total Material Cost</span>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-2">
                  ৳{Number(technicianReport?.materialCost || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Parts sourced for completed servicing</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500">Labor Margin / Profit</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
                  ৳{Number(technicianReport?.profit || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Gross labor fees generated from jobs</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs bg-emerald-50/30 border-emerald-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-emerald-800">My Profit Share</span>
                <div className="text-2xl font-bold font-mono text-emerald-900 mt-2">
                  ৳{Number(technicianReport?.technicianShare || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-1">
                  Commission at {technicianReport?.technician?.profitSharePercentage || 0}% rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* "My Servicing Details" Table */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">My Servicing Details</CardTitle>
                <CardDescription className="text-xs">
                  Completed repair jobs with real itemized cost, parts, and labor profit
                </CardDescription>
              </div>
              <Badge className="bg-slate-100 text-slate-700 font-normal">
                {technicianReport?.details?.length || 0} Service Job(s)
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Service Details</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Cost (৳)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Material Cost (৳)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Profit (৳)</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!technicianReport?.details?.length ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          No servicing jobs recorded for this technician in the selected range.
                        </td>
                      </tr>
                    ) : (
                      technicianReport.details.map((j: any) => (
                        <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-medium text-slate-800">
                            <div>{j.device}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Invoice: {j.invoiceNo || j.order?.orderCode || "N/A"}
                            </div>
                            {j.problems && (
                              <div className="text-[10px] text-emerald-700 mt-0.5">
                                {Array.isArray(j.problems)
                                  ? j.problems.map((p: any) => p.name || p).join(", ")
                                  : JSON.stringify(j.problems)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {new Date(j.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                            ৳{Number(j.totalCost || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            ৳{Number(j.materialCost || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                            ৳{Number(j.profit || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              className={`text-[10px] font-semibold border-none ${
                                j.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {j.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Technician Performance & Profit */}
        {!isTechnician && (
          <TabsContent value="performance-view" className="space-y-6">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Technician Performance Matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  Efficiency metrics, completed repair turnaround, and profit share accruals
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Staff Member</th>
                        <th className="py-2.5 px-3 font-semibold">Branch</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Total Jobs</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Completed</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Active</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Labor Generated (৳)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Material Used (৳)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Share Rate</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Accrued Commission (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {techPerformance.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-6 text-slate-400">
                            No technician performance data available.
                          </td>
                        </tr>
                      ) : (
                        techPerformance.map((tp: any) => (
                          <tr key={tp.technicianId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {tp.technicianName}
                              {tp.employeeId && (
                                <span className="ml-1 text-[10px] text-slate-400 font-mono">({tp.employeeId})</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600">{tp.branch?.name || "Global"}</td>
                            <td className="py-3 px-3 text-center font-bold">{tp.totalJobs}</td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-600">{tp.completedJobs}</td>
                            <td className="py-3 px-3 text-center font-semibold text-amber-600">{tp.activeJobs}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                              ৳{Number(tp.totalLaborRevenue || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              ৳{Number(tp.totalMaterialCost || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                              {tp.profitSharePercentage}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                              ৳{Number(tp.accruedProfitShare || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 4: Shopwise & Marketing Fee Report */}
        {!isTechnician && (
          <TabsContent value="shopwise-view" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shopwise Servicing Aggregations */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-sm font-bold text-slate-800">Shopwise Servicing Breakdown</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Cross-branch comparison of servicing volumes and gross profits
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Branch</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Jobs</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Service Rev (৳)</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Net Margin (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {shopwiseReport?.shopwiseData?.map((sw: any) => (
                          <tr key={sw.branchId} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {sw.branchName}
                              <span className="block text-[10px] text-slate-400 font-mono">{sw.code}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                              {sw.totalServiceJobs}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                              ৳{Number(sw.serviceRevenue || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ৳{Number(sw.netServiceProfit || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Fee Collection Report */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <CardTitle className="text-sm font-bold text-slate-800">Marketing Fee Collection</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Reconciliation of referral and promotional fees across branches
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-purple-900 block">Total Marketing Fee Collected</span>
                      <span className="text-2xl font-bold font-mono text-purple-800">
                        ৳{Number(marketingFeeReport?.totalMarketingFee || 0).toLocaleString()}
                      </span>
                    </div>
                    <Badge className="bg-purple-200 text-purple-900 border-none">
                      {marketingFeeReport?.transactionsCount || 0} Txns
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500">
                    <p className="mb-2">
                      Marketing and referral levies are collected from eligible service jobs and sales orders to fund affiliate campaigns.
                    </p>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
                      <div>Active Referral Scheme: <span className="font-semibold text-slate-800">Enabled</span></div>
                      <div>Default Referral Surcharge: <span className="font-semibold text-slate-800">0.00% (Standard)</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
