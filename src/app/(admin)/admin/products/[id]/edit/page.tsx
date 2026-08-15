"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { mockProducts } from "@/lib/mock-data/products/all-products";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const product = mockProducts.find(p => p.id === params.id);

  useEffect(() => {
    setTitle(`Edit ${product?.name || "Product"}`);
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!product) {
    return <div className="p-6 text-slate-500">Product not found.</div>;
  }

  // Map the MockProduct to the form's expected structure
  const initialData = {
    name: product.name,
    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
    shortDescription: "A great product.",
    fullDescription: "Full details here...",
    images: [product.image],
    variants: [],
    price: product.price,
    salePrice: product.oldPrice,
    costPrice: undefined,
    specifications: [
      { label: "Warranty", value: "6 Months" }
    ],
    metaTitle: product.name,
    metaDescription: "",
    metaKeywords: "",
    status: product.status === "Draft" ? "Draft" as const : "Active" as const,
    category: product.category,
    brand: product.brand,
  };

  return (
    <div className="pb-10">
      <ProductForm initialData={initialData} isEdit={true} />
    </div>
  );
}
