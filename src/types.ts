import { Timestamp } from 'firebase/firestore';

export type Role = 'owner' | 'admin' | 'accountant' | 'cashier' | 'viewer' | 'sales' | 'inventory' | 'hr';

export type ModuleCategory = 'finance' | 'sales' | 'hr' | 'operations' | 'settings';

export interface Module {
  id: string;
  key: string;
  name_ar: string;
  name_en: string;
  icon: string;
  category: ModuleCategory;
  route: string;
  order_number: number;
  is_active: boolean;
}

export interface Permission {
  id: string;
  key: string;
  name_ar: string;
}

export interface DBCompanyModule {
  id: string;
  company_id: string;
  module_key: string;
  is_enabled: boolean;
}

export type SectorKey = 
  | 'services' | 'construction' | 'grocery' | 'laundry' 
  | 'cafe_restaurant' | 'retail' | 'recruitment' | 'other';

export interface Company {
  id: string;
  name: string;
  taxNumber?: string;
  ownerUid: string;
  plan: 'free' | 'pro' | 'enterprise';
  sectorKey: SectorKey;
  onboardingCompleted: boolean;
  createdAt: Timestamp;
}

export interface CompanyModule {
  id: string;
  companyId: string;
  moduleKey: string;
  isEnabled: boolean;
  enabledBy: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  isOwner: boolean;
  permissions: string[];
  companyId: string;
  active: boolean;
  createdAt: Timestamp;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  companyId: string;
  createdBy: string;
  createdAt: Timestamp;
  reminderSentAt?: string;
  items: InvoiceItem[];
}

export interface Customer {
  id: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  companyId: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  taxRate: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  companyId: string;
  createdAt: Timestamp;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentQuantity: number;
  newStock: number;
  reason: 'damage' | 'correction' | 'expired' | 'return' | 'other';
  referenceNumber: string;
  adjustedByUserID: string;
  note?: string;
  date: string;
  companyId: string;
  createdBy: string;
  createdAt: Timestamp;
}
