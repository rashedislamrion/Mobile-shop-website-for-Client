"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { apiGet, apiPost } from "@/lib/api-client";
import { toast } from "sonner";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  Truck,
  FileText,
  User,
  Store,
  CheckCircle,
  AlertCircle,
  Wrench,
  Repeat,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PosInvoiceModal } from "@/components/admin/pos/PosInvoiceModal";
import Link from "next/link";

interface PosProductVariant {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  color: string | null;
  quality: string | null;
  sku: string;
  stock: number;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  categoryName: string;
  categoryId: string;
  categorySlug: string;
  brandName: string | null;
  allVariants: {
    id: string;
    color: string | null;
    quality: string | null;
    sku: string;
    stock: number;
    price: number;
  }[];
}

interface CartItem {
  id: string; // unique cart key (variantId or serviceId)
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  color?: string | null;
  quality?: string | null;
  sku?: string;
  stock: number;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  isService?: boolean;
  serviceDetails?: {
    device: string;
    issueDescription: string;
  };
}

interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeItem[];
}

interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  addresses?: { id: string; fullAddress: string }[];
}

export default function PosTerminalPage() {
  const { setTitle, setBadge, setDateFilter, selectedBranchId, selectedBranchName } = useAdminPage();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"products" | "services" | "exchange">("products");

  // Products & Categories State
  const [products, setProducts] = useState<PosProductVariant[]>([]);
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Product Details Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState<PosProductVariant | null>(null);
  const [modalVariantId, setModalVariantId] = useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalPriceOverride, setModalPriceOverride] = useState<number | string>("");

  // Services Tab Form State
  const [serviceDevice, setServiceDevice] = useState("");
  const [serviceIssue, setServiceIssue] = useState("");
  const [serviceCharge, setServiceCharge] = useState<number | string>(500);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer State
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Quick Action Toggles
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = useState<number | string>("");

  const [showCourier, setShowCourier] = useState(false);
  const [courierPartner, setCourierPartner] = useState("Steadfast");
  const [courierAddress, setCourierAddress] = useState("");
  const [courierDeliveryCharge, setCourierDeliveryCharge] = useState<number | string>(120);

  const [showNote, setShowNote] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  // Payment Method State
  const [paymentMode, setPaymentMode] = useState<"CASH" | "SPLIT" | "PAY_LATER">("CASH");
  const [splitCashAmount, setSplitCashAmount] = useState<number | string>("");
  const [splitBankAmount, setSplitBankAmount] = useState<number | string>("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Branches
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState("");

  useEffect(() => {
    setTitle("POS Terminal");
    setBadge("Point of Sale");
    setDateFilter("");
  }, [setTitle, setBadge, setDateFilter]);

  // Load branches
  useEffect(() => {
    apiGet<any[]>("/branches/public")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setBranches(res);
          const matched = selectedBranchId && selectedBranchId !== "all"
            ? res.find((b) => b.id === selectedBranchId)
            : res[0];
          setCurrentBranchId(matched ? matched.id : res[0].id);
        }
      })
      .catch(() => {});
  }, [selectedBranchId]);

  // Load Categories Tree
  useEffect(() => {
    apiGet<CategoryTreeItem[]>("/categories/tree")
      .then((res) => {
        if (Array.isArray(res)) {
          setCategories(res);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch POS Products with Debounce
  const loadProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const params: Record<string, any> = { limit: 100 };
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await apiGet<PosProductVariant[]>("/products/pos-search", params);
      setProducts(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to search products");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Customer Search with Debounce
  useEffect(() => {
    if (!customerSearchQuery.trim()) {
      setCustomerSearchResults([]);
      return;
    }
    setIsSearchingCustomers(true);
    const timer = setTimeout(() => {
      apiGet<CustomerSearchResult[]>("/orders/customers/search", { q: customerSearchQuery.trim() })
        .then((res) => {
          if (Array.isArray(res)) setCustomerSearchResults(res);
        })
        .catch(() => {})
        .finally(() => setIsSearchingCustomers(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  // Handle Product Row Click -> Open Product Details Dialog
  const handleOpenProductModal = (product: PosProductVariant) => {
    setSelectedProductForModal(product);
    setModalVariantId(product.id);
    setModalQuantity(1);
    setModalPriceOverride(product.price);
  };

  // Currently active variant in details modal
  const activeModalVariant = useMemo(() => {
    if (!selectedProductForModal) return null;
    if (modalVariantId) {
      const found = selectedProductForModal.allVariants.find((v) => v.id === modalVariantId);
      if (found) return found;
    }
    return {
      id: selectedProductForModal.id,
      color: selectedProductForModal.color,
      quality: selectedProductForModal.quality,
      sku: selectedProductForModal.sku,
      stock: selectedProductForModal.stock,
      price: selectedProductForModal.price,
    };
  }, [selectedProductForModal, modalVariantId]);

  // When variant changes in modal, update price override
  const handleSelectModalVariant = (variantId: string) => {
    setModalVariantId(variantId);
    if (selectedProductForModal) {
      const v = selectedProductForModal.allVariants.find((item) => item.id === variantId);
      if (v) {
        setModalPriceOverride(v.price);
      }
    }
  };

  // Add from Details Modal to Cart
  const handleAddModalProductToCart = () => {
    if (!selectedProductForModal || !activeModalVariant) return;

    const qty = Number(modalQuantity) || 1;
    if (qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (activeModalVariant.stock < qty) {
      toast.warning(`Note: Available stock (${activeModalVariant.stock}) is less than requested (${qty}).`);
    }

    const unitPrice = Number(modalPriceOverride) >= 0 ? Number(modalPriceOverride) : activeModalVariant.price;
    const cartItemId = activeModalVariant.id;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + qty, unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: selectedProductForModal.productId,
          variantId: activeModalVariant.id.startsWith("pv-") ? undefined : activeModalVariant.id,
          name: selectedProductForModal.productName,
          image: selectedProductForModal.productImage,
          color: activeModalVariant.color,
          quality: activeModalVariant.quality,
          sku: activeModalVariant.sku,
          stock: activeModalVariant.stock,
          unitPrice,
          originalPrice: activeModalVariant.price,
          quantity: qty,
        },
      ];
    });

    toast.success(`Added ${qty}x ${selectedProductForModal.productName} to cart`);
    setSelectedProductForModal(null);
  };

  // Add Service item to Cart
  const handleAddServiceToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDevice.trim() || !serviceIssue.trim()) {
      toast.error("Please enter device model and issue description");
      return;
    }

    const charge = Number(serviceCharge) || 0;
    const serviceItemId = `svc-${Date.now()}`;

    setCart((prev) => [
      ...prev,
      {
        id: serviceItemId,
        productId: products[0]?.productId || "service-item",
        name: `Service: ${serviceDevice.trim()}`,
        isService: true,
        serviceDetails: {
          device: serviceDevice.trim(),
          issueDescription: serviceIssue.trim(),
        },
        stock: 999,
        unitPrice: charge,
        originalPrice: charge,
        quantity: 1,
      },
    ]);

    toast.success(`Service for "${serviceDevice}" added to cart`);
    setServiceDevice("");
    setServiceIssue("");
  };

  // Cart Actions
  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearchQuery("");
    setShowDiscount(false);
    setDiscountValue("");
    setShowCourier(false);
    setCourierAddress("");
    setShowNote(false);
    setOrderNote("");
    setPaymentMode("CASH");
    setSplitCashAmount("");
    setSplitBankAmount("");
  };

  // Financial Calculations (Numeric-Safe)
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    if (!showDiscount || !discountValue) return 0;
    const num = Number(discountValue) || 0;
    if (discountType === "percent") {
      return Math.round((cartSubtotal * Math.min(100, Math.max(0, num))) / 100);
    }
    return Math.min(cartSubtotal, Math.max(0, num));
  }, [showDiscount, discountValue, discountType, cartSubtotal]);

  const calculatedDelivery = useMemo(() => {
    if (!showCourier) return 0;
    return Number(courierDeliveryCharge) || 0;
  }, [showCourier, courierDeliveryCharge]);

  const netTotal = Math.max(0, cartSubtotal - calculatedDiscount + calculatedDelivery);

  // Split payment validation
  const splitTotal = (Number(splitCashAmount) || 0) + (Number(splitBankAmount) || 0);

  // Sale Submission
  const handleProcessOrder = async (isDiagnosingAction = false) => {
    if (cart.length === 0) {
      toast.error("Cart is empty. Please select products or services to proceed.");
      return;
    }

    if (!currentBranchId) {
      toast.error("Please select an active branch.");
      return;
    }

    if (showCourier && !courierAddress.trim() && !selectedCustomer?.addresses?.[0]?.fullAddress) {
      toast.error("Please provide a courier delivery address.");
      return;
    }

    if (paymentMode === "SPLIT" && !isDiagnosingAction) {
      if (splitTotal !== netTotal) {
        toast.error(`Split payment total (৳${splitTotal.toLocaleString()}) must equal the Net Payable (৳${netTotal.toLocaleString()}). Difference: ৳${(netTotal - splitTotal).toLocaleString()}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Determine payment & sale types
      let saleType: "POS" | "COURIER" | "DIAGNOSING" = "POS";
      let status: "CONFIRMED" | "DIAGNOSING" | "PENDING" = "CONFIRMED";
      let paidAmount = netTotal;

      if (isDiagnosingAction) {
        saleType = "DIAGNOSING";
        status = "DIAGNOSING";
        paidAmount = paymentMode === "PAY_LATER" ? 0 : netTotal;
      } else if (showCourier) {
        saleType = "COURIER";
        status = "PENDING";
        paidAmount = paymentMode === "PAY_LATER" ? 0 : netTotal;
      } else if (paymentMode === "PAY_LATER") {
        paidAmount = 0;
      } else if (paymentMode === "SPLIT") {
        paidAmount = splitTotal;
      }

      // Check if service line items exist
      const serviceItem = cart.find((i) => i.isService);

      const payload = {
        branchId: currentBranchId,
        customerId: selectedCustomer?.id || undefined,
        saleType,
        status,
        items: cart.map((item) => ({
          productId: item.productId.startsWith("service-item") ? products[0]?.productId || item.productId : item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discountAmount: calculatedDiscount,
        deliveryCharge: calculatedDelivery,
        paidAmount,
        note: orderNote.trim() || (paymentMode === "SPLIT" ? `Split Payment: Cash ৳${Number(splitCashAmount || 0)}, Bank/Digital ৳${Number(splitBankAmount || 0)}` : undefined),
        shippingAddress: showCourier ? courierAddress || selectedCustomer?.addresses?.[0]?.fullAddress || "Customer Delivery Address" : undefined,
        courierPartner: showCourier ? courierPartner : undefined,
        device: serviceItem?.serviceDetails?.device || (isDiagnosingAction ? "Diagnostic Intake Device" : undefined),
        issueDescription: serviceItem?.serviceDetails?.issueDescription || (isDiagnosingAction ? "Customer device diagnostic inspection" : undefined),
        serviceCharge: serviceItem ? serviceItem.unitPrice : undefined,
      };

      const res = await apiPost<any>("/orders", payload);
      setCompletedOrder(res);
      setInvoiceModalOpen(true);
      toast.success(isDiagnosingAction ? "Diagnostic order registered!" : "POS Sale completed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Products / Services / Exchange Catalog (~65% / 8 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Top Control Bar: Tabs & Live Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Tabs: Products / Services / Exchange */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "products"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" /> Products
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "services"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" /> Services
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("exchange")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "exchange"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" /> Exchange
                </button>
              </div>

              {/* Branch Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Outlet:</span>
                <select
                  value={currentBranchId}
                  onChange={(e) => setCurrentBranchId(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Search Bar (Active on Products Tab) */}
            {activeTab === "products" && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search products by model, brand, SKU (e.g. OLED, Battery, S22 Ultra)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-sm bg-slate-50/70 border-slate-200 focus:bg-white rounded-xl"
                />
              </div>
            )}
          </div>

          {/* ================= PRODUCTS TAB VIEW ================= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-emerald-600 text-white shadow-sm font-bold"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product Variant Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold z-10">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-3">Variant / SKU</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-center">Stock</th>
                        <th className="py-3 px-4 text-right">Price (৳)</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingProducts ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Loading catalog products...
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No products found matching your search.
                          </td>
                        </tr>
                      ) : (
                        products.map((item) => {
                          const isLowStock = item.stock > 0 && item.stock <= 5;
                          const isOutOfStock = item.stock <= 0;

                          return (
                            <tr
                              key={item.id}
                              onClick={() => handleOpenProductModal(item)}
                              className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                                      {item.productName}
                                    </p>
                                    {item.brandName && (
                                      <span className="text-[10px] text-slate-400 font-medium">{item.brandName}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div>
                                  {(item.color || item.quality) && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {item.color && (
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                          {item.color}
                                        </span>
                                      )}
                                      {item.quality && (
                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                                          {item.quality}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.sku}</span>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-slate-600">
                                {item.categoryName}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    isOutOfStock
                                      ? "bg-rose-100 text-rose-800"
                                      : isLowStock
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {isOutOfStock ? "Out of Stock" : `${item.stock} in stock`}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="font-bold text-slate-900 text-sm">
                                  ৳{item.price.toLocaleString()}
                                </div>
                                {item.salePrice && item.salePrice < item.regularPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ৳{item.regularPrice.toLocaleString()}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenProductModal(item);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SERVICES TAB VIEW ================= */}
          {activeTab === "services" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900">Repair & Technical Services</h3>
                  <p className="text-xs text-slate-500">Intake custom service requests and hardware repairs</p>
                </div>
              </div>

              <form onSubmit={handleAddServiceToCart} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Device Model / Name *
                  </label>
                  <Input
                    placeholder="e.g. iPhone 13 Pro Max / Samsung S22 Ultra..."
                    value={serviceDevice}
                    onChange={(e) => setServiceDevice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Reported Issue / Required Repair *
                  </label>
                  <Textarea
                    placeholder="Describe issue (e.g. Screen replacement, Battery draining, Camera glass cracked)..."
                    value={serviceIssue}
                    onChange={(e) => setServiceIssue(e.target.value)}
                    className="h-20 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Service Charge / Estimated Fee (৳) *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Service to Cart
                </button>
              </form>
            </div>
          )}

          {/* ================= EXCHANGE TAB VIEW ================= */}
          {activeTab === "exchange" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Device Exchange & Trade-In</h3>
                  <p className="text-xs text-slate-500">
                    Process old customer handset trade-ins with valuation assessment
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-3">
                <p>
                  For full valuation assessments, IMEI condition audits, and multi-item trade-in balance deductions,
                  use the dedicated <strong>Exchanges Module</strong>.
                </p>
                <Link
                  href="/admin/sales/exchanges/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  Open Full Exchange Flow <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Sticky Cart Panel (~35% / 4-5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-4">
            {/* Header: Customer Select & Date */}
            <div className="border-b border-slate-100 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">POS Cart</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Selector Search */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Customer
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search customer (phone / name)..."
                      value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : customerSearchQuery}
                      onChange={(e) => {
                        setSelectedCustomer(null);
                        setCustomerSearchQuery(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      className="pl-8 h-9 text-xs font-medium"
                    />
                    {selectedCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchQuery("");
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Dropdown Results */}
                {isCustomerDropdownOpen && customerSearchResults.length > 0 && !selectedCustomer && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {customerSearchResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsCustomerDropdownOpen(false);
                          if (c.addresses?.[0]?.fullAddress) {
                            setCourierAddress(c.addresses[0].fullAddress);
                          }
                        }}
                        className="p-2.5 hover:bg-emerald-50 cursor-pointer text-xs transition-colors"
                      >
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Cart is currently empty.</p>
                  <p className="text-[11px] text-slate-400">Click any product on the left to add items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs gap-2"
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      {(item.color || item.quality) && (
                        <p className="text-[10px] text-slate-500">
                          {item.color ? `Color: ${item.color}` : ""} {item.quality ? `(${item.quality})` : ""}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-600 font-medium">
                        ৳{item.unitPrice.toLocaleString()}{" "}
                        {item.unitPrice !== item.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ৳{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total & Remove */}
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions Row: Discount, Courier, Note */}
            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscount(!showDiscount)}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    showDiscount
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600" /> Discount
                </button>

                <button
                  type="button"
                  onClick={() => setShowCourier(!showCourier)}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    showCourier
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> Courier
                </button>

                <button
                  type="button"
                  onClick={() => setShowNote(!showNote)}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    showNote
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Note
                </button>
              </div>

              {/* Inline Discount Control */}
              {showDiscount && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span>Discount Type</span>
                    <div className="flex bg-white rounded-md border border-amber-200 p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDiscountType("fixed")}
                        className={`px-2 py-0.5 rounded ${discountType === "fixed" ? "bg-amber-600 text-white font-bold" : "text-slate-600"}`}
                      >
                        Fixed (৳)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("percent")}
                        className={`px-2 py-0.5 rounded ${discountType === "percent" ? "bg-amber-600 text-white font-bold" : "text-slate-600"}`}
                      >
                        Percent (%)
                      </button>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter discount amount..."
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-8 text-xs bg-white font-semibold text-amber-900"
                  />
                </div>
              )}

              {/* Inline Courier Control */}
              {showCourier && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-800 mb-1">Partner</label>
                      <select
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="Steadfast">Steadfast Courier</option>
                        <option value="Pathao">Pathao Courier</option>
                        <option value="RedX">RedX Delivery</option>
                        <option value="Sundarban">Sundarban Courier</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="SA Paribahan">SA Paribahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-800 mb-1">Delivery (৳)</label>
                      <Input
                        type="number"
                        min={0}
                        value={courierDeliveryCharge}
                        onChange={(e) => setCourierDeliveryCharge(e.target.value)}
                        className="h-8 text-xs bg-white font-semibold"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Delivery destination address..."
                    value={courierAddress}
                    onChange={(e) => setCourierAddress(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              )}

              {/* Inline Note Control */}
              {showNote && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-xs">
                  <Textarea
                    placeholder="Internal sale notes (customer instructions, technician remarks)..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="h-16 text-xs bg-white resize-none"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("CASH")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMode === "CASH"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Cash (Full)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("SPLIT");
                    setSplitCashAmount(Math.round(netTotal / 2));
                    setSplitBankAmount(netTotal - Math.round(netTotal / 2));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMode === "SPLIT"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Split Pay
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("PAY_LATER")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMode === "PAY_LATER"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Pay Later
                </button>
              </div>

              {/* Split Payment Inputs */}
              {paymentMode === "SPLIT" && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Cash (৳)</label>
                      <Input
                        type="number"
                        min={0}
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        className="h-8 text-xs bg-white font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Bank/Digital (৳)</label>
                      <Input
                        type="number"
                        min={0}
                        value={splitBankAmount}
                        onChange={(e) => setSplitBankAmount(e.target.value)}
                        className="h-8 text-xs bg-white font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-500">Allocated Sum:</span>
                    <span className={`font-bold ${splitTotal === netTotal ? "text-emerald-700" : "text-rose-600"}`}>
                      ৳{splitTotal.toLocaleString()} / ৳{netTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {paymentMode === "PAY_LATER" && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Due balance of ৳{netTotal.toLocaleString()} will be charged to the customer&apos;s ledger.
                </p>
              )}
            </div>

            {/* Financial Summary Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold">-৳{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              {calculatedDelivery > 0 && (
                <div className="flex justify-between text-blue-700">
                  <span>Delivery Charge:</span>
                  <span className="font-bold">+৳{calculatedDelivery.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-900">Net Payable:</span>
                <span className="text-lg font-black text-emerald-700">
                  ৳{netTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bottom Primary Actions: Complete Sale & Diagnosing */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleProcessOrder(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <ShieldCheck className="w-5 h-5" />
                {isSubmitting ? "Processing Sale..." : `Complete Sale (৳${netTotal.toLocaleString()})`}
              </button>

              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={() => handleProcessOrder(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                Intake as Diagnosing Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT DETAILS MODAL (Color, Quality, Quantity Stepper, Override Price)  */}
      {/* ========================================================================= */}
      {selectedProductForModal && (
        <Dialog
          open={Boolean(selectedProductForModal)}
          onOpenChange={(open) => {
            if (!open) setSelectedProductForModal(null);
          }}
        >
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border border-slate-200">
            <DialogHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    {selectedProductForModal.productName}
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {selectedProductForModal.categoryName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-700 block">
                    ৳{activeModalVariant?.price.toLocaleString()}
                  </span>
                  {selectedProductForModal.salePrice && selectedProductForModal.salePrice < selectedProductForModal.regularPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ৳{selectedProductForModal.regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="p-5 space-y-4 text-xs">
              {/* Product SKU & Stock Status Banner */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Selected SKU</span>
                  <p className="font-mono font-bold text-slate-800">{activeModalVariant?.sku}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Current Stock</span>
                  <p className={`font-bold ${activeModalVariant && activeModalVariant.stock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {activeModalVariant?.stock} units available
                  </p>
                </div>
              </div>

              {/* Variant Selector (if multiple variants exist) */}
              {selectedProductForModal.allVariants.length > 1 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Select Variant / Quality
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProductForModal.allVariants.map((v) => {
                      const isSelected = activeModalVariant?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectModalVariant(v.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="font-bold text-xs">
                            {v.color || "Standard"} {v.quality ? `(${v.quality})` : ""}
                          </div>
                          <div className="flex justify-between items-center text-[10px] mt-1 text-slate-500">
                            <span>Stock: {v.stock}</span>
                            <span className="font-bold text-slate-800">৳{v.price.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Price Override */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Quantity *
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-2xs"
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      min={1}
                      value={modalQuantity}
                      onChange={(e) => setModalQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="h-8 text-center text-sm font-bold border-none bg-transparent shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Override Price (৳)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={modalPriceOverride}
                    onChange={(e) => setModalPriceOverride(e.target.value)}
                    placeholder="Regular price"
                    className="h-10 text-sm font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="bg-slate-100/80 p-3 rounded-xl flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Line Total:</span>
                <span className="text-base text-emerald-700">
                  ৳{(Number(modalPriceOverride || activeModalVariant?.price || 0) * modalQuantity).toLocaleString()}
                </span>
              </div>

              {/* Add to Cart Action */}
              <button
                type="button"
                onClick={handleAddModalProductToCart}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart ({modalQuantity}x)
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* POST-SALE PRINTABLE INVOICE MODAL                                         */}
      {/* ========================================================================= */}
      <PosInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        order={completedOrder}
        onNewSale={() => {
          setInvoiceModalOpen(false);
          clearCart();
        }}
      />
    </div>
  );
}
