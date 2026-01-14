
export type PageView = 'dashboard' | 'products' | 'team' | 'kpi' | 'documents' | 'database' | 'about' | 'settings';
export type UserRole = 'admin' | 'user';

export interface Product {
  id: string;
  name: string;
  specs: string;
  defects: string;
  status: 'approved' | 'rejected' | 'pending';
  image: string;
  manufacturer?: string; // New field for manufacturer name
}

export interface Employee {
  id: string;
  name: string;
  employeeCode?: string; // New field for HR/Employee Code
  role: string;
  department: 'management' | 'qc' | 'qa';
  joinedDate: string;
  email: string;
  phone: string;
  image?: string;
  stampData?: string; // New field for quality stamps/codes
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word';
  size: string;
  date: string;
  url: string; // Simulated URL
}

export interface KPIData {
  month: string;
  year: string;
  qualityRate: number;
  defects: number;
  // New Production Metrics
  reservedBlowPieces: number;
  reservedBlowWeight: number;
  reservedInjectionPieces: number;
  reservedInjectionWeight: number;
  scrappedPieces: number;
  scrappedWeight: number;
  scrappedBlow: number;
  scrappedInjection: number;
  // PPM Scrap Rates
  internalScrapPpm: number;
  externalScrapPpm: number;
  // Non-Conformance Reports per Shift
  ncrShift1: number;
  ncrShift2: number;
  ncrShift3: number;
  // Customer & Logistics Metrics
  totalSupplied: number;
  totalReturned: number;
  totalComplaints: number;
  // Added Metrics
  totalProduction: number;
  totalInternalReserved: number;
}

export interface CompanySettings {
  name: string;
  slogan: string;
  address: string;
  logo: string;
  email: string;
  phone: string;
  website: string;
  registrationNumber: string;
  certificates?: string; // New field for company certificates
}
