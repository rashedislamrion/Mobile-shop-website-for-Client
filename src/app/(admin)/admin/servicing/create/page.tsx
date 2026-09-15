"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  Hash, 
  Wrench, 
  Smartphone, 
  Tag, 
  Layers, 
  Package, 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useStaffAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LookupItem {
  id: string;
  name: string;
  status?: string;
  days?: number;
  suggestedLaborPrice?: number | string;
}

interface BrandItem {
  id: string;
  name: string;
}

interface SupplierItem {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
}

interface ProductCatalogItem {
  id: string;
  name: string;
  code?: string;
  purchasePrice?: number | string;
  sellingPrice?: number | string;
}

interface CustomerMatch {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface TechnicianItem {
  id: string;
  name: string;
  phone?: string;
  employeeId?: string;
  isTechnician?: boolean;
}

interface MaterialRow {
  id: string;
  partName: string;
  productId?: string;
  supplierId: string;
  cost: number;
  quantity: number;
  total: number;
}

interface PaymentRow {
  method: string;
  amount: number;
}

const AVAILABLE_PAYMENT_METHODS = [
  { id: "CASH", label: "Cash" },
  { id: "BKASH", label: "bKash" },
  { id: "CARD", label: "Card" },
  { id: "BANK_TRANSFER", label: "Bank Transfer" },
  { id: "SSLCOMMERZ", label: "SSLCommerz" },
];

export default function CreateServicingJobPage() {
  const router = useRouter();
  const { setTitle, setBadge } = useAdminPage();
  const { user } = useStaffAuth();

  // Lookups & Options State
  const [deviceTypes, setDeviceTypes] = useState<LookupItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [problemTypes, setProblemTypes] = useState<LookupItem[]>([]);
  const [warrantyPeriods, setWarrantyPeriods] = useState<LookupItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianItem[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalogItem[]>([]);

  // Section 1: Customer Information
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [referralNumber, setReferralNumber] = useState("");
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerMatch | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Section 2: Employee & Invoice
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  // Section 3: Device Information
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [deviceModel, setDeviceModel] = useState("");

  // Section 4: Problem Details
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [problemSearchQuery, setProblemSearchQuery] = useState("");

  // Section 5: Material History
  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      id: "mat-1",
      partName: "",
      productId: "",
      supplierId: "",
      cost: 0,
      quantity: 1,
      total: 0,
    },
  ]);

  // Section 6: Warranty
  const [selectedWarrantyPeriod, setSelectedWarrantyPeriod] = useState("No Warranty");
  const [warrantyStartDate, setWarrantyStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [warrantyEndDate, setWarrantyEndDate] = useState("");

  // Section 7: Pricing
  const [laborPrice, setLaborPrice] = useState<number>(0);

  // Section 8: Billing & Payment
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(["CASH"]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({ CASH: 0 });

  // Section 9: Service Summary
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set Page Title
  useEffect(() => {
    setTitle("Create New Service Job");
    setBadge("Repair Intake");
  }, [setTitle, setBadge]);

  // Fetch initial lookups
  useEffect(() => {
    // Device Types
    apiGet<LookupItem[]>("/service-lookups/device-types")
      .then((res) => setDeviceTypes(Array.isArray(res) ? res : []))
      .catch(() => {});

    // Problem Types
    apiGet<LookupItem[]>("/service-lookups/problem-types")
      .then((res) => setProblemTypes(Array.isArray(res) ? res : []))
      .catch(() => {});

    // Warranty Periods
    apiGet<LookupItem[]>("/service-lookups/warranty-periods")
      .then((res) => setWarrantyPeriods(Array.isArray(res) ? res : []))
      .catch(() => {});

    // Brands
    apiGet<BrandItem[]>("/brands")
      .then((res) => setBrands(Array.isArray(res) ? res : []))
      .catch(() => {});

    // Suppliers
    apiGet<any>("/suppliers")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setSuppliers(list);
      })
      .catch(() => {});

    // Technicians
    apiGet<any>("/employees/technicians")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setTechnicians(list);
        if (user && list.some((t: any) => t.id === user.id)) {
          setSelectedTechnicianId(user.id);
        } else if (list.length > 0 && !selectedTechnicianId) {
          setSelectedTechnicianId(list[0].id);
        }
      })
      .catch(() => {});

    // Catalog Products (spare parts / products)
    apiGet<any>("/products?limit=100")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setCatalogProducts(list);
      })
      .catch(() => {});

    // Auto-fetch Next Invoice Number
    fetchNextInvoice();
  }, []);

  const fetchNextInvoice = async () => {
    try {
      setIsLoadingInvoice(true);
      const res = await apiGet<{ invoiceNo: string }>("/service-jobs/next-invoice-number");
      if (res?.invoiceNo) {
        setInvoiceNo(res.invoiceNo);
      }
    } catch {
      // Fallback if network blip
      if (!invoiceNo) setInvoiceNo(`INV-${Date.now().toString().slice(-4)}`);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // Inline Customer Search with debounce on phone
  useEffect(() => {
    const cleanPhone = customerPhone.trim();
    if (cleanPhone.length >= 10) {
      setIsSearchingCustomer(true);
      const timer = setTimeout(async () => {
        try {
          const res = await apiGet<CustomerMatch[]>("/orders/customers/search", { q: cleanPhone });
          if (Array.isArray(res) && res.length > 0) {
            const exactOrFirst = res.find((c) => c.phone.includes(cleanPhone)) || res[0];
            setMatchedCustomer(exactOrFirst);
            if (!customerName) {
              setCustomerName(exactOrFirst.name);
            }
          } else {
            setMatchedCustomer(null);
          }
        } catch {
          setMatchedCustomer(null);
        } finally {
          setIsSearchingCustomer(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setMatchedCustomer(null);
    }
  }, [customerPhone]);

  // Warranty Period auto-calculate end date
  const handleWarrantyChange = (periodName: string) => {
    setSelectedWarrantyPeriod(periodName);
    const found = warrantyPeriods.find((w) => w.name === periodName);
    if (!found || found.days === 0 || periodName === "No Warranty") {
      setWarrantyEndDate("");
      return;
    }
    const start = new Date(warrantyStartDate || new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + (found.days || 30));
    setWarrantyEndDate(end.toISOString().split("T")[0]);
  };

  // Problems toggle and labor charge auto-suggestion
  const handleToggleProblem = (prob: LookupItem) => {
    setSelectedProblemIds((prev) => {
      const exists = prev.includes(prob.id);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== prob.id);
      } else {
        updated = [...prev, prob.id];
      }

      // Compute suggested labor price
      const totalSuggestedLabor = updated.reduce((sum, id) => {
        const p = problemTypes.find((item) => item.id === id);
        return sum + (Number(p?.suggestedLaborPrice) || 0);
      }, 0);

      if (totalSuggestedLabor > 0) {
        setLaborPrice(totalSuggestedLabor);
      }
      return updated;
    });
  };

  // Material History row operations
  const handleAddMaterialRow = () => {
    setMaterials((prev) => [
      ...prev,
      {
        id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        partName: "",
        productId: "",
        supplierId: suppliers[0]?.id || "",
        cost: 0,
        quantity: 1,
        total: 0,
      },
    ]);
  };

  const handleRemoveMaterialRow = (rowId: string) => {
    setMaterials((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));
  };

  const handleUpdateMaterialRow = (rowId: string, field: keyof MaterialRow, value: any) => {
    setMaterials((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        if (field === "productId" && value) {
          const prod = catalogProducts.find((p) => p.id === value);
          if (prod) {
            updated.partName = prod.name;
            const unitCost = Number(prod.purchasePrice) || Number(prod.sellingPrice) || 0;
            updated.cost = unitCost;
          }
        }
        if (field === "cost" || field === "quantity" || field === "productId") {
          updated.total = Number(updated.cost || 0) * Number(updated.quantity || 1);
        }
        return updated;
      })
    );
  };

  // Calculations
  const totalMaterialCost = useMemo(() => {
    return materials.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
  }, [materials]);

  const totalBill = useMemo(() => {
    return Number(laborPrice || 0) + Number(totalMaterialCost || 0);
  }, [laborPrice, totalMaterialCost]);

  const finalAmount = useMemo(() => {
    const net = totalBill - Number(discount || 0);
    return Math.max(0, net);
  }, [totalBill, discount]);

  // Payment method toggling
  const handleTogglePaymentMethod = (methodId: string) => {
    setSelectedPaymentMethods((prev) => {
      const exists = prev.includes(methodId);
      if (exists) {
        if (prev.length === 1) {
          toast.warning("At least one payment method must remain selected.");
          return prev;
        }
        const filtered = prev.filter((m) => m !== methodId);
        setPaymentAmounts((amounts) => {
          const copy = { ...amounts };
          delete copy[methodId];
          return copy;
        });
        return filtered;
      } else {
        setPaymentAmounts((amounts) => ({
          ...amounts,
          [methodId]: 0,
        }));
        return [...prev, methodId];
      }
    });
  };

  const handlePaymentAmountChange = (methodId: string, value: number) => {
    setPaymentAmounts((prev) => ({
      ...prev,
      [methodId]: Number(value) || 0,
    }));
  };

  const totalPaidAmount = useMemo(() => {
    return selectedPaymentMethods.reduce((sum, method) => {
      return sum + (Number(paymentAmounts[method]) || 0);
    }, 0);
  }, [selectedPaymentMethods, paymentAmounts]);

  const dueAmount = useMemo(() => {
    return Math.max(0, finalAmount - totalPaidAmount);
  }, [finalAmount, totalPaidAmount]);

  const handleQuickFillFullPayment = () => {
    if (selectedPaymentMethods.length === 0) return;
    const primaryMethod = selectedPaymentMethods[0];
    const newAmounts: Record<string, number> = {};
    selectedPaymentMethods.forEach((m) => {
      newAmounts[m] = m === primaryMethod ? finalAmount : 0;
    });
    setPaymentAmounts(newAmounts);
  };

  // Filtered problems for search
  const filteredProblems = useMemo(() => {
    if (!problemSearchQuery.trim()) return problemTypes;
    return problemTypes.filter((p) =>
      p.name.toLowerCase().includes(problemSearchQuery.toLowerCase())
    );
  }, [problemTypes, problemSearchQuery]);

  // Selected device and brand labels
  const selectedDeviceTypeName = useMemo(() => {
    return deviceTypes.find((d) => d.id === selectedDeviceTypeId)?.name || "Device";
  }, [deviceTypes, selectedDeviceTypeId]);

  const selectedBrandName = useMemo(() => {
    return brands.find((b) => b.id === selectedBrandId)?.name || "";
  }, [brands, selectedBrandId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerPhone.trim()) {
      toast.error("Customer phone number is required.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!selectedDeviceTypeId) {
      toast.error("Please select a device type.");
      return;
    }
    if (!selectedBrandId) {
      toast.error("Please select a brand.");
      return;
    }
    if (selectedProblemIds.length === 0) {
      toast.error("Please select at least one problem / issue.");
      return;
    }
    if (selectedPaymentMethods.length === 0) {
      toast.error("Please select at least one payment method.");
      return;
    }

    // Validate materials: each must have a part name and supplier
    for (let i = 0; i < materials.length; i++) {
      const mat = materials[i];
      if (mat.cost > 0 || mat.partName.trim()) {
        if (!mat.partName.trim()) {
          toast.error(`Part name is required for Material Row #${i + 1}.`);
          return;
        }
        if (!mat.supplierId) {
          toast.error(`Supplier is required for Material Row #${i + 1} (${mat.partName}).`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      const chosenProblems = problemTypes.filter((p) => selectedProblemIds.includes(p.id));
      const compositeDeviceString = `${selectedBrandName} ${deviceModel}`.trim() || selectedDeviceTypeName;
      const issuesString = chosenProblems.map((p) => p.name).join(", ");

      const paymentsPayload = selectedPaymentMethods
        .filter((m) => Number(paymentAmounts[m]) > 0)
        .map((m) => ({
          method: m,
          amount: Number(paymentAmounts[m]) || 0,
        }));

      const materialsPayload = materials
        .filter((m) => m.partName.trim().length > 0)
        .map((m) => ({
          partName: m.partName.trim(),
          productId: m.productId || undefined,
          supplierId: m.supplierId,
          cost: Number(m.cost) || 0,
          quantity: Number(m.quantity) || 1,
          total: Number(m.total) || 0,
        }));

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        referralNumber: referralNumber.trim() || undefined,
        customerId: matchedCustomer?.id || undefined,
        technicianId: selectedTechnicianId || undefined,
        invoiceNo: invoiceNo.trim() || undefined,
        deviceTypeId: selectedDeviceTypeId,
        deviceType: selectedDeviceTypeName,
        brandId: selectedBrandId,
        model: deviceModel.trim() || undefined,
        device: compositeDeviceString,
        issueDescription: issuesString || "Device repair diagnostic intake",
        problems: chosenProblems.map((p) => ({
          id: p.id,
          name: p.name,
          suggestedLaborPrice: Number(p.suggestedLaborPrice) || 0,
        })),
        warrantyPeriod: selectedWarrantyPeriod,
        warrantyStartDate: warrantyStartDate || undefined,
        warrantyEndDate: warrantyEndDate || undefined,
        laborCost: Number(laborPrice) || 0,
        materialCost: Number(totalMaterialCost) || 0,
        totalBill: Number(totalBill) || 0,
        discount: Number(discount) || 0,
        finalAmount: Number(finalAmount) || 0,
        paidAmount: Number(totalPaidAmount) || 0,
        dueAmount: Number(dueAmount) || 0,
        materials: materialsPayload,
        payments: paymentsPayload,
        status: "IN_PROGRESS",
      };

      const res = await apiPost<{ success: boolean; serviceJob: any }>("/service-jobs/repair", payload);
      toast.success(`Service Job ${res?.serviceJob?.invoiceNo || ""} created successfully!`);
      router.push("/admin/sales/service");
    } catch (err: any) {
      toast.error(err.message || "Failed to create service job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              iFixFast Servicing Workflow
            </span>
            <span className="text-xs text-emerald-200/80">IMEI-Free Repair Intake</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Repair Service</h1>
          <p className="text-emerald-100/90 text-sm mt-0.5">
            Full walk-in service intake, supplier-linked spare parts, and technician profit distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/sales/service")}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 shadow-md"
          >
            {isSubmitting ? "Creating Job..." : "Create Service (Submit)"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Intake Columns (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">Customer Information</CardTitle>
                    <CardDescription className="text-xs">Client identification & referral record</CardDescription>
                  </div>
                </div>
                {matchedCustomer && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-normal">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Linked to Existing Customer
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-9 font-medium"
                    required
                  />
                  {isSearchingCustomer && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin absolute right-3 top-3 text-slate-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Type 11-digit mobile number</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Customer Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="e.g. Rafiqul Islam"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-9 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Referral Number <span className="text-slate-400 font-normal">(যে রেফার করেছেন)</span>
                </Label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="tel"
                    placeholder="Referrer Phone (Optional)"
                    value={referralNumber}
                    onChange={(e) => setReferralNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Employee & Invoice */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Employee & Invoice</CardTitle>
                  <CardDescription className="text-xs">Assigned servicing technician and unique job invoice</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Assigned Technician <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Select Technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.phone || t.employeeId || "Staff"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Defaults to logged-in technician</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Invoice Number <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-1">
                    <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      placeholder="INV-0001"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      className="pl-9 font-mono font-bold"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchNextInvoice}
                    disabled={isLoadingInvoice}
                    title="Auto-suggest next invoice"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInvoice ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sequential identifier, editable if required</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Device Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Device Information</CardTitle>
                  <CardDescription className="text-xs">Dependent lookup: Device Type → Brand → Model</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Device Type <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={selectedDeviceTypeId}
                  onChange={(e) => {
                    setSelectedDeviceTypeId(e.target.value);
                    if (!e.target.value) {
                      setSelectedBrandId("");
                      setDeviceModel("");
                    }
                  }}
                  className="w-full mt-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Device Type...</option>
                  {deviceTypes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Brand <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={selectedBrandId}
                  disabled={!selectedDeviceTypeId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    if (!e.target.value) setDeviceModel("");
                  }}
                  className="w-full mt-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  required
                >
                  <option value="">
                    {selectedDeviceTypeId ? "Select Brand..." : "Select device type first..."}
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Device Model <span className="text-rose-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder={selectedBrandId ? "e.g. 13 Pro Max, S23 Ultra" : "Select brand first..."}
                    value={deviceModel}
                    disabled={!selectedBrandId}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="pl-9 font-medium"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Problem Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Problem Details <span className="text-rose-500">*</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Multi-select checklist from database lookup with suggested labor rates
                    </CardDescription>
                  </div>
                </div>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Filter issues..."
                    value={problemSearchQuery}
                    onChange={(e) => setProblemSearchQuery(e.target.value)}
                    className="h-7 pl-7 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredProblems.map((prob) => {
                  const isChecked = selectedProblemIds.includes(prob.id);
                  return (
                    <div
                      key={prob.id}
                      onClick={() => handleToggleProblem(prob)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-semibold truncate">{prob.name}</span>
                      </div>
                      {Number(prob.suggestedLaborPrice) > 0 && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex-shrink-0">
                          ৳{Number(prob.suggestedLaborPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedProblemIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Selected issues: <span className="font-semibold text-slate-800">{selectedProblemIds.length}</span>
                  </span>
                  <span className="text-emerald-700 font-medium">
                    Auto-suggested Labor Charge applied to pricing
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Material History (Supplier Linked Spare Parts) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Material History (Parts & Sourcing)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Supplier-linked parts with catalog search or free-text entry
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMaterialRow}
                  className="text-xs h-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Part / Material
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-3">
                {materials.map((row, idx) => (
                  <div
                    key={row.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end"
                  >
                    {/* Part Name / Catalog Picker (5 cols) */}
                    <div className="md:col-span-4">
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                        <span>Part / Material Name *</span>
                        {catalogProducts.length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-normal">Free text or select:</span>
                        )}
                      </Label>
                      <div className="space-y-1">
                        <Input
                          placeholder="e.g. OLED Display Panel"
                          value={row.partName}
                          onChange={(e) => handleUpdateMaterialRow(row.id, "partName", e.target.value)}
                          className="h-8 text-xs bg-white font-medium"
                        />
                        {catalogProducts.length > 0 && (
                          <select
                            value={row.productId || ""}
                            onChange={(e) => handleUpdateMaterialRow(row.id, "productId", e.target.value)}
                            className="w-full h-7 text-[11px] rounded border border-slate-300 bg-white px-2 text-slate-700"
                          >
                            <option value="">Or Pick from Spare-Parts Catalog...</option>
                            {catalogProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (৳{Number(p.purchasePrice || p.sellingPrice || 0)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Sourced Supplier (3 cols) - Client Requested Feature */}
                    <div className="md:col-span-3">
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1">
                        Sourced Supplier * <span className="text-emerald-600 font-bold">(Main Source)</span>
                      </Label>
                      <select
                        value={row.supplierId}
                        onChange={(e) => handleUpdateMaterialRow(row.id, "supplierId", e.target.value)}
                        className="w-full h-8 text-xs rounded-md border border-slate-300 bg-white px-2 text-slate-800 focus:ring-emerald-500 font-medium"
                        required
                      >
                        <option value="">Select Supplier...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name || s.companyName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Cost (2 cols) */}
                    <div className="md:col-span-2">
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1">Unit Cost (৳) *</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={row.cost === 0 ? "" : row.cost}
                        onChange={(e) => handleUpdateMaterialRow(row.id, "cost", e.target.value)}
                        className="h-8 text-xs bg-white font-mono font-bold"
                      />
                    </div>

                    {/* Quantity (1 col) */}
                    <div className="md:col-span-1">
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleUpdateMaterialRow(row.id, "quantity", e.target.value)}
                        className="h-8 text-xs bg-white text-center font-bold"
                      />
                    </div>

                    {/* Total & Action (2 cols) */}
                    <div className="md:col-span-2 flex items-center justify-between gap-1">
                      <div>
                        <Label className="text-[11px] font-semibold text-slate-600 mb-1">Total</Label>
                        <div className="text-xs font-mono font-bold text-slate-800 py-1">
                          ৳{Number(row.total || 0).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={materials.length <= 1}
                        onClick={() => handleRemoveMaterialRow(row.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Delete material row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Running Total Material Cost */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-xs font-semibold text-blue-900">Total Material Cost:</span>
                <span className="text-base font-bold font-mono text-blue-800">
                  ৳{totalMaterialCost.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Sidebar (1 col): Warranty, Pricing, Payments, Summary */}
        <div className="space-y-6">
          {/* Section 6: Warranty */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Warranty Coverage</CardTitle>
                  <CardDescription className="text-xs">Post-repair warranty guarantee period</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Warranty Period *</Label>
                <select
                  value={selectedWarrantyPeriod}
                  onChange={(e) => handleWarrantyChange(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-800 focus:ring-emerald-500"
                  required
                >
                  {warrantyPeriods.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWarrantyPeriod !== "No Warranty" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">Start Date</Label>
                    <Input
                      type="date"
                      value={warrantyStartDate}
                      onChange={(e) => {
                        setWarrantyStartDate(e.target.value);
                        handleWarrantyChange(selectedWarrantyPeriod);
                      }}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">End Date</Label>
                    <Input
                      type="date"
                      value={warrantyEndDate}
                      onChange={(e) => setWarrantyEndDate(e.target.value)}
                      className="h-8 text-xs mt-1 font-semibold text-purple-700"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 7 & 8: Pricing & Billing */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  7 & 8
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Pricing & Billing</CardTitle>
                  <CardDescription className="text-xs">Labor charges & split payment breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Labor Price */}
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Service / Labor Price (৳) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Receipt className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={laborPrice === 0 ? "" : laborPrice}
                    onChange={(e) => setLaborPrice(Number(e.target.value) || 0)}
                    className="pl-9 font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Technician profit share is calculated exclusively on this labor margin.
                </p>
              </div>

              {/* Payment Methods Multi-select */}
              <div className="pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Select Payment Method(s) <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {AVAILABLE_PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethods.includes(method.id);
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method.id)}
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>

                {selectedPaymentMethods.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-2">
                    Please select at least one payment method above to input details
                  </p>
                )}
              </div>

              {/* Payment Amount Inputs (Split Payment) */}
              {selectedPaymentMethods.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Collected Amounts:</span>
                    <button
                      type="button"
                      onClick={handleQuickFillFullPayment}
                      className="text-[11px] text-emerald-600 font-bold hover:underline"
                    >
                      Quick Fill Full (৳{finalAmount.toLocaleString()})
                    </button>
                  </div>
                  {selectedPaymentMethods.map((m) => {
                    const meta = AVAILABLE_PAYMENT_METHODS.find((pm) => pm.id === m);
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="w-28 text-xs font-medium text-slate-600 truncate">{meta?.label}:</span>
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">৳</span>
                          <Input
                            type="number"
                            min="0"
                            value={paymentAmounts[m] === 0 ? "" : paymentAmounts[m]}
                            onChange={(e) => handlePaymentAmountChange(m, Number(e.target.value))}
                            placeholder="0"
                            className="h-8 pl-6 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 9: Service Summary */}
          <Card className="border-slate-300 shadow-md bg-white sticky top-4">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-900 text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  9
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Service Summary</CardTitle>
                  <CardDescription className="text-xs text-slate-300">Live recap & job finalization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Labor / Service Charge:</span>
                <span className="font-mono font-bold text-slate-800">৳{laborPrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Material Cost:</span>
                <span className="font-mono font-bold text-blue-700">৳{totalMaterialCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-800 font-semibold pt-1 border-t border-slate-100">
                <span>TOTAL BILL:</span>
                <span className="font-mono font-bold">৳{totalBill.toLocaleString()}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-rose-600 font-medium">DISCOUNT (-):</span>
                <div className="relative w-24">
                  <span className="absolute left-2 top-1.5 text-xs text-rose-500 font-mono">৳</span>
                  <Input
                    type="number"
                    min="0"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-7 pl-5 text-xs font-mono font-bold text-rose-600 border-rose-200 focus:ring-rose-500 text-right"
                  />
                </div>
              </div>

              {/* Final Amount */}
              <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">FINAL AMOUNT</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">৳{finalAmount.toLocaleString()}</div>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <div>Paid: <span className="font-mono font-bold text-white">৳{totalPaidAmount.toLocaleString()}</span></div>
                  {dueAmount > 0 ? (
                    <div className="text-amber-300 font-bold">Due: ৳{dueAmount.toLocaleString()}</div>
                  ) : (
                    <div className="text-emerald-300 font-semibold">Fully Paid</div>
                  )}
                </div>
              </div>

              {/* Create Service Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 text-base shadow-md mt-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Service Job...</span>
                  </div>
                ) : (
                  <span>Create Service (Submit)</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
