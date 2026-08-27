"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Package, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api-client";
import Image from "next/image";

interface BranchItem {
  id: string;
  name: string;
  code: string;
}

interface ProductItem {
  id: string;
  name: string;
  variants: {
    id: string;
    sku: string;
    color?: string | null;
    quality?: string | null;
    stock: number;
    price: number | string;
  }[];
  images?: { url: string }[];
}

export default function CreateStockAdjustmentPage() {
  const { setTitle, setBadge, setDateFilter, selectedBranchId } = useAdminPage();
  const router = useRouter();

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [branchId, setBranchId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"INCREASE" | "DECREASE" | "RECOUNT">("INCREASE");
  const [quantityInput, setQuantityInput] = useState<number | string>(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTitle("New Stock Adjustment");
    setBadge("Inventory");
    setDateFilter("");
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    setIsLoadingData(true);
    Promise.all([
      apiGet<BranchItem[]>("/branches/public"),
      apiGet<{ data: ProductItem[] }>("/products", { limit: 100 }),
    ])
      .then(([branchRes, prodRes]) => {
        if (Array.isArray(branchRes)) {
          setBranches(branchRes);
          if (branchRes.length > 0) {
            // Default to admin context branch or first branch
            const matched = selectedBranchId && selectedBranchId !== "all" 
              ? branchRes.find(b => b.id === selectedBranchId)
              : branchRes[0];
            setBranchId(matched ? matched.id : branchRes[0].id);
          }
        }

        if (prodRes?.data) {
          setProducts(prodRes.data);
          if (prodRes.data.length > 0) {
            const first = prodRes.data[0];
            setSelectedProductId(first.id);
            if (first.variants && first.variants.length > 0) {
              setSelectedVariantId(first.variants[0].id);
            }
          }
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load branches and products");
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [selectedBranchId]);

  // Selected product & variant details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const selectedVariant = useMemo(() => {
    if (!selectedProduct) return null;
    if (selectedVariantId) {
      return selectedProduct.variants?.find((v) => v.id === selectedVariantId) || selectedProduct.variants?.[0] || null;
    }
    return selectedProduct.variants?.[0] || null;
  }, [selectedProduct, selectedVariantId]);

  // When product changes, reset variant to first variant
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
    } else {
      setSelectedVariantId("");
    }
  };

  // Safe numeric calculations
  const currentStock = Number(selectedVariant?.stock ?? 0);
  const qty = Number(quantityInput) || 0;

  let newStock = currentStock;
  let quantityChange = 0;

  if (adjustmentType === "INCREASE") {
    newStock = currentStock + qty;
    quantityChange = qty;
  } else if (adjustmentType === "DECREASE") {
    newStock = Math.max(0, currentStock - qty);
    quantityChange = -qty;
  } else if (adjustmentType === "RECOUNT") {
    newStock = qty;
    quantityChange = qty - currentStock;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    if (!reason) {
      toast.error("Please select an adjustment reason");
      return;
    }
    if (reason === "Other" && !notes.trim()) {
      toast.error("Please provide explanatory notes for 'Other' reason");
      return;
    }
    if (quantityInput === "" || Number(quantityInput) < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiPost("/stock-adjustments", {
        branchId,
        productId: selectedProductId,
        variantId: selectedVariant?.id || undefined,
        type: adjustmentType,
        quantity: qty,
        reason,
        notes: notes.trim() || undefined,
      });

      toast.success("Stock adjustment recorded successfully!");
      router.push("/admin/stock-adjustments");
    } catch (err: any) {
      toast.error(err.message || "Failed to save stock adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/stock-adjustments")}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stock Adjustments
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Target Branch & Product
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Branch / Location *
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                    required
                  >
                    <option value="">Select Branch...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                    required
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variant Select (if multiple variants exist) */}
              {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Variant / SKU *
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  >
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        SKU: {v.sku} {v.color ? `— Color: ${v.color}` : ""} {v.quality ? `(${v.quality})` : ""} — Stock: {v.stock} units
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Current Stock Banner */}
              {selectedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-blue-900">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-medium">
                      Selected SKU: <span className="font-mono font-bold text-blue-800">{selectedVariant?.sku || "N/A"}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-600 block uppercase font-semibold">Current Stock</span>
                    <span className="text-base font-bold text-blue-900">{currentStock} units</span>
                  </div>
                </div>
              )}
            </div>

            {/* Adjustment Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Adjustment Configuration
              </h3>

              {/* Adjustment Type Radios */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Adjustment Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adjustmentType === "INCREASE"
                        ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="INCREASE"
                      checked={adjustmentType === "INCREASE"}
                      onChange={() => setAdjustmentType("INCREASE")}
                      className="text-emerald-600 focus:ring-emerald-600"
                    />
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Increase
                      </div>
                      <span className="text-xs text-slate-500">Add stock</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adjustmentType === "DECREASE"
                        ? "bg-rose-50/70 border-rose-500 ring-1 ring-rose-500 text-rose-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="DECREASE"
                      checked={adjustmentType === "DECREASE"}
                      onChange={() => setAdjustmentType("DECREASE")}
                      className="text-rose-600 focus:ring-rose-600"
                    />
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" /> Decrease
                      </div>
                      <span className="text-xs text-slate-500">Remove stock</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adjustmentType === "RECOUNT"
                        ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 text-blue-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="RECOUNT"
                      checked={adjustmentType === "RECOUNT"}
                      onChange={() => setAdjustmentType("RECOUNT")}
                      className="text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Set Exact
                      </div>
                      <span className="text-xs text-slate-500">Physical recount</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {adjustmentType === "INCREASE" && "Quantity to Add *"}
                  {adjustmentType === "DECREASE" && "Quantity to Remove *"}
                  {adjustmentType === "RECOUNT" && "New Total Count (Physical Recount) *"}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-11 text-base font-semibold"
                    placeholder="Enter quantity..."
                    required
                  />
                </div>

                {/* Live Preview Helper */}
                <div className="mt-2.5 flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Live Calculation Preview:</span>
                  <span className={`text-sm font-bold ${
                    newStock > currentStock 
                      ? "text-emerald-700" 
                      : newStock < currentStock 
                      ? "text-rose-700" 
                      : "text-slate-700"
                  }`}>
                    New stock will be: {newStock} units
                  </span>
                </div>
              </div>

              {/* Reason Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Reason for Adjustment *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="New Stock Received">New Stock Received</option>
                  <option value="Damaged">Damaged / Defective</option>
                  <option value="Recount Correction">Recount Correction / Audit</option>
                  <option value="Theft/Loss">Theft / Unaccounted Loss</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                  <option value="Customer Return Stock Addition">Customer Return Stock Addition</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes (Required if Other) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Notes / Audit Explanation {reason === "Other" ? "*" : "(Optional)"}
                </label>
                <Textarea
                  placeholder="Provide any additional context or reference notes for this adjustment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-24 text-sm"
                  required={reason === "Other"}
                />
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Summary Card (1 Col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6 space-y-6">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
                Adjustment Summary
              </h3>

              {/* Summary Items */}
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Product</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedProduct?.name || "No product selected"}
                  </p>
                  {selectedVariant && (
                    <span className="text-xs text-slate-500 font-mono">
                      SKU: {selectedVariant.sku}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Branch</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {branches.find((b) => b.id === branchId)?.name || "No branch selected"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Adjustment Type</span>
                  <div className="mt-1">
                    {adjustmentType === "INCREASE" && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Stock Addition (+{qty})
                      </span>
                    )}
                    {adjustmentType === "DECREASE" && (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Stock Deduction (-{qty})
                      </span>
                    )}
                    {adjustmentType === "RECOUNT" && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <RefreshCw className="w-3.5 h-3.5" /> Recount Target ({qty})
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Before -> After Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Stock Before:</span>
                    <span className="font-bold text-slate-700">{currentStock} units</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Net Change:</span>
                    <span className={`font-bold ${quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {quantityChange >= 0 ? `+${quantityChange}` : quantityChange} units
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Stock After:</span>
                    <span className="font-extrabold text-base text-slate-900">
                      {newStock} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProductId || !branchId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving Adjustment..." : "Save Adjustment"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin/stock-adjustments")}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
