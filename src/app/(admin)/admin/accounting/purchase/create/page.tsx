"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { mockSuppliers } from "@/lib/mock-data/accounting/suppliers";

interface LineItem {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export default function CreatePurchaseOrderPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    branch: "Dhaka Main Branch",
    shipping: 0,
    discount: 0,
    taxPercent: 0,
    note: ""
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", productName: "", quantity: 1, unitCost: 0, lineTotal: 0 }
  ]);

  useEffect(() => {
    setTitle("Create Purchase Order");
    setBadge("Accounting");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), productName: "", quantity: 1, unitCost: 0, lineTotal: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate line total if qty or cost changes
        if (field === 'quantity' || field === 'unitCost') {
          updatedItem.lineTotal = updatedItem.quantity * updatedItem.unitCost;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = (subtotal * formData.taxPercent) / 100;
  const grandTotal = subtotal + taxAmount + formData.shipping - formData.discount;

  const handleSave = (status: string) => {
    if (!formData.supplierId || items.some(i => !i.productName)) {
      toast.error("Please select a supplier and fill all item names.");
      return;
    }
    toast.success(`Purchase Order ${status === 'Draft' ? 'saved as Draft' : 'Created successfully'}`);
    router.push("/admin/accounting/purchase");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Purchase Orders
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT MAIN FORM */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Order Details</h3>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Supplier *</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">Choose Supplier...</option>
                  {mockSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Date *</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Branch</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                >
                  <option value="Global">Global</option>
                  <option value="Dhaka Main Branch">Dhaka Main Branch</option>
                  <option value="Chattogram Branch">Chattogram Branch</option>
                </select>
              </div>
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Products</h3>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Product Name</th>
                    <th className="px-6 py-3 font-semibold w-32">Quantity</th>
                    <th className="px-6 py-3 font-semibold w-40">Unit Cost (৳)</th>
                    <th className="px-6 py-3 font-semibold w-40">Line Total</th>
                    <th className="px-6 py-3 font-semibold w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <Input 
                          placeholder="e.g. iPhone 15 Pro Max"
                          value={item.productName}
                          onChange={e => handleItemChange(item.id, 'productName', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleItemChange(item.id, 'unitCost', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ৳{item.lineTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 font-medium rounded-lg transition-colors text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
              <div className="text-slate-500 text-sm font-medium">Subtotal: <span className="text-slate-800 font-bold ml-2">৳{subtotal.toLocaleString()}</span></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-sm font-semibold text-slate-700 block mb-2">Order Notes</label>
            <Textarea 
              placeholder="Any instructions for the supplier..."
              className="h-24 resize-none"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

        </div>

        {/* RIGHT STICKY SIDEBAR */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6 sticky top-[100px]">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-600 whitespace-nowrap">Tax (%)</span>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  className="h-8 w-20 text-right"
                  value={formData.taxPercent}
                  onChange={e => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-600 whitespace-nowrap">Shipping (৳)</span>
                <Input 
                  type="number" 
                  min="0"
                  className="h-8 w-24 text-right"
                  value={formData.shipping}
                  onChange={e => setFormData({ ...formData, shipping: Number(e.target.value) })}
                />
              </div>

              <div className="flex justify-between items-center text-sm gap-4 pb-4 border-b border-slate-100">
                <span className="text-slate-600 whitespace-nowrap">Discount (৳)</span>
                <Input 
                  type="number" 
                  min="0"
                  className="h-8 w-24 text-right text-emerald-600 font-medium"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                />
              </div>

              <div className="flex justify-between items-end pt-2">
                <span className="text-base font-bold text-slate-800">Grand Total</span>
                <span className="text-2xl font-black text-emerald-600">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <button 
              onClick={() => handleSave('Ordered')}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm Order
            </button>
            <button 
              onClick={() => handleSave('Draft')}
              className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
