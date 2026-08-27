"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api-client";

interface POLineItem {
  variantId: string;
  quantityOrdered: number;
  unitCost: number;
  lineTotal: number;
}

export default function CreatePurchaseOrderPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    branchId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    shippingCost: 0,
    discount: 0,
    taxPercent: 0,
    amountPaid: 0,
    walletTypeId: "",
    note: "",
  });

  const [items, setItems] = useState<POLineItem[]>([
    { variantId: "", quantityOrdered: 1, unitCost: 0, lineTotal: 0 }
  ]);

  useEffect(() => {
    setTitle("Create Purchase Order");
    setBadge("Accounting");
    setDateFilter(""); 
  }, [setTitle, setBadge, setDateFilter]);

  useEffect(() => {
    Promise.all([
      apiGet<{ data: any[] }>("/suppliers", { limit: 100 }),
      apiGet<any[]>("/branches/public"),
      apiGet<{ data: any[] }>("/products", { limit: 100 }),
      apiGet<any[]>("/wallet-types"),
    ])
      .then(([supRes, branchRes, prodRes, walletRes]) => {
        if (supRes?.data) setSuppliers(supRes.data);
        if (Array.isArray(branchRes)) setBranches(branchRes);
        if (Array.isArray(walletRes)) {
          setWallets(walletRes);
          if (walletRes.length > 0) setFormData((prev) => ({ ...prev, walletTypeId: walletRes[0].id }));
        }

        if (prodRes?.data) {
          const varList: any[] = [];
          prodRes.data.forEach((p: any) => {
            if (p.variants && p.variants.length > 0) {
              p.variants.forEach((v: any) => {
                varList.push({
                  id: v.id,
                  name: `${p.name} - ${v.sku} (${v.color || "Standard"})`,
                  buyingPrice: Number(v.buyingPrice || p.regularPrice || 0),
                });
              });
            }
          });
          setVariants(varList);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    setItems([...items, { variantId: "", quantityOrdered: 1, unitCost: 0, lineTotal: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleVariantSelect = (idx: number, variantId: string) => {
    const selectedVar = variants.find((v) => v.id === variantId);
    const cost = selectedVar ? selectedVar.buyingPrice : 0;

    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      variantId,
      unitCost: cost,
      lineTotal: newItems[idx].quantityOrdered * cost,
    };
    setItems(newItems);
  };

  const handleQtyCostChange = (idx: number, field: "quantityOrdered" | "unitCost", value: number) => {
    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      [field]: value,
    };
    newItems[idx].lineTotal = newItems[idx].quantityOrdered * newItems[idx].unitCost;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = (subtotal * formData.taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount + Number(formData.shippingCost) - Number(formData.discount));
  const dueAmount = Math.max(0, grandTotal - Number(formData.amountPaid));

  const handleSave = async () => {
    if (!formData.supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    const validItems = items.filter((i) => i.variantId && i.quantityOrdered > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid product variant item");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiPost("/purchase-orders", {
        supplierId: formData.supplierId,
        branchId: formData.branchId || undefined,
        orderDate: formData.orderDate,
        expectedDate: formData.expectedDate || undefined,
        shippingCost: Number(formData.shippingCost || 0),
        discount: Number(formData.discount || 0),
        taxAmount,
        amountPaid: Number(formData.amountPaid || 0),
        walletTypeId: Number(formData.amountPaid || 0) > 0 ? formData.walletTypeId : undefined,
        note: formData.note || undefined,
        items: validItems.map((i) => ({
          variantId: i.variantId,
          quantityOrdered: Number(i.quantityOrdered),
          unitCost: Number(i.unitCost),
        })),
      });

      toast.success("Purchase order created successfully");
      router.push("/admin/accounting/purchase");
    } catch (err: any) {
      toast.error(err.message || "Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Purchase Orders
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT MAIN FORM */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Order Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Supplier *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Receiving Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  <option value="">Global / Headquarters</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Order Date *</label>
                <Input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Expected Delivery</label>
                <Input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800">Order Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 w-full">
                    <select
                      value={item.variantId}
                      onChange={(e) => handleVariantSelect(idx, e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    >
                      <option value="">Select Product Variant</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantityOrdered}
                      onChange={(e) => handleQtyCostChange(idx, "quantityOrdered", Number(e.target.value))}
                    />
                  </div>

                  <div className="w-36">
                    <Input
                      type="number"
                      placeholder="Unit Cost (৳)"
                      value={item.unitCost}
                      onChange={(e) => handleQtyCostChange(idx, "unitCost", Number(e.target.value))}
                    />
                  </div>

                  <div className="w-36 text-right font-bold text-slate-800 text-sm">
                    ৳{item.lineTotal.toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Order Notes</label>
              <Textarea
                placeholder="Shipping instructions, terms, notes..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: Order Summary */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6 sticky top-[100px]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Financial Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Tax Rate (%)</span>
                  <Input
                    type="number"
                    value={formData.taxPercent}
                    onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                    className="w-20 h-8 text-right text-xs"
                  />
                </div>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Tax Amount</span>
                  <span>+৳{taxAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-slate-600 text-xs">
                <span>Shipping Cost (৳)</span>
                <Input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                  className="w-24 h-8 text-right text-xs"
                />
              </div>

              <div className="flex justify-between items-center text-slate-600 text-xs">
                <span>Discount (৳)</span>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-24 h-8 text-right text-xs"
                />
              </div>

              <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-emerald-700">৳{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Advance Amount Paid (৳)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amountPaid || ""}
                  onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                />

                {Number(formData.amountPaid) > 0 && (
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-slate-700 block">Disburse From Wallet</label>
                    <select
                      value={formData.walletTypeId}
                      onChange={(e) => setFormData({ ...formData, walletTypeId: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (৳{Number(w.currentBalance).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold pt-2">
                  <span className="text-slate-600">Remaining Due:</span>
                  <span className="text-rose-600">৳{dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" /> Save Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
