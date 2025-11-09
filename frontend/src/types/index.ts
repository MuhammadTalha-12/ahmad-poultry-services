// Core types for Ahmad Poultry Services

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  opening_balance: string;
  running_balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyRate {
  id: number;
  date: string;
  default_cost_rate: string;
  default_sale_rate: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  opening_balance: string;
  closing_balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  date: string;
  supplier: number | null;
  supplier_name: string;
  vehicle_number: string;
  kg: string;
  cost_rate_per_kg: string;
  amount_paid: string;
  total_cost: string;
  borrow_amount: string;
  supplier_closing_balance: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  date: string;
  customer: number;
  customer_name: string;
  kg: string;
  sale_rate_per_kg: string;
  cost_rate_snapshot: string;
  total_amount: string;
  amount_received: string;
  borrow_amount: string;
  profit: string;
  customer_closing_balance: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  date: string;
  customer: number;
  customer_name: string;
  amount: string;
  method: 'cash' | 'bank' | 'other';
  note: string;
  auto_allocated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerDeduction {
  id: number;
  date: string;
  customer: number;
  customer_name: string;
  amount: string;
  deduction_type: 'return' | 'discount' | 'damage' | 'other';
  deduction_type_display: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  date: string;
  category: 'van_repair' | 'feed' | 'salary' | 'petrol' | 'other';
  category_display: string;
  amount: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierPayment {
  id: number;
  date: string;
  supplier: number;
  supplier_name: string;
  amount: string;
  method: 'cash' | 'bank' | 'other';
  method_display: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReport {
  date: string;
  purchases_kg: string;
  purchases_cost: string;
  purchases_by_vehicle?: Record<string, {
    kg: string;
    cost: string;
    count: number;
  }>;
  sales_kg: string;
  sales_revenue: string;
  profit: string;
  cash_received: string;
  cash_from_sales: string;
  cash_from_payments: string;
  borrow: string;
  expenses_total: string;
  closing_stock: string;
}

export interface PeriodReport extends DailyReport {
  start_date: string;
  end_date: string;
  expenses_by_category: Record<string, string>;
  customer_breakdown: Record<string, {
    kg: string;
    revenue: string;
    profit: string;
    running_balance: string;
  }>;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

