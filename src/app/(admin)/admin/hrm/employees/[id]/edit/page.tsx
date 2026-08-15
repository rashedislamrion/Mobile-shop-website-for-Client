"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
import { mockEmployees } from "@/lib/mock-data/hrm/employees";

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  
  const employee = mockEmployees.find(e => e.id === params.id) || mockEmployees[0];

  useEffect(() => {
    setTitle("Edit Employee");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EmployeeForm initialData={employee} isEdit />;
}
