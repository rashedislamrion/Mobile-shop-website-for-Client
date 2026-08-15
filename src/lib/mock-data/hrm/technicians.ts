import { Employee, mockEmployees } from "./employees";

export type TechnicianSpecialization = 'Display' | 'Battery' | 'Software' | 'Camera' | 'Charging Port' | 'General';

export interface Technician extends Employee {
  specializations: TechnicianSpecialization[];
  activeJobs: number;
  completedThisMonth: number;
  availability: "Available" | "Busy" | "Off Duty";
  rating: number; // out of 5
}

// Derive technicians from mockEmployees where role is Technician
export const mockTechnicians: Technician[] = mockEmployees
  .filter(emp => emp.role === "Technician")
  .map(emp => ({
    ...emp,
    specializations: emp.id === "emp-8" ? ["Display", "Battery", "General"] : ["Software", "Charging Port"],
    activeJobs: emp.id === "emp-8" ? 3 : 1,
    completedThisMonth: emp.id === "emp-8" ? 42 : 18,
    availability: emp.id === "emp-8" ? "Busy" : "Available",
    rating: emp.id === "emp-8" ? 4.8 : 4.5,
  }));
