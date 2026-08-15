"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { BranchForm } from "@/components/admin/BranchForm";
import { mockBranches, Branch } from "@/lib/mock-data/branches";
import { useParams } from "next/navigation";

export default function EditBranchPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const params = useParams();
  const [branchData, setBranchData] = useState<Branch | null>(null);

  useEffect(() => {
    setTitle(`Edit Branch: ${branchData?.name || "Loading..."}`);
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchData]);

  useEffect(() => {
    // Simulate API fetch
    const data = mockBranches.find(b => b.id === params.id);
    if (data) {
      setBranchData(data);
    }
  }, [params.id]);

  if (!branchData) {
    return <div className="p-8 text-center text-slate-500">Loading branch data...</div>;
  }

  return (
    <div className="pb-10">
      <BranchForm isEdit={true} initialData={branchData} />
    </div>
  );
}
