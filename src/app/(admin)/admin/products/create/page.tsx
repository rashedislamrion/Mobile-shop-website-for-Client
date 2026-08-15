"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { ProductForm } from "@/components/admin/ProductForm";

export default function CreateProductPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();

  useEffect(() => {
    setTitle("Add New Product");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-10">
      <ProductForm isEdit={false} />
    </div>
  );
}
