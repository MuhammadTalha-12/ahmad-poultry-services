import api from './api';
import type { Customer, PaginatedResponse } from '../types';

// Service for customer-related API calls with enhanced search capabilities
export class CustomerService {
  
  /**
   * Get all customers with pagination support
   */
  static async getAllCustomers(pageSize: number = 10000): Promise<PaginatedResponse<Customer>> {
    try {
      const response = await api.get(`/api/customers/?page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  }

  /**
   * Get active customers for dropdowns (most common use case)
   */
  static async getActiveCustomers(pageSize: number = 10000): Promise<PaginatedResponse<Customer>> {
    try {
      const response = await api.get(`/api/customers/?is_active=true&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active customers:', error);
      throw error;
    }
  }

  /**
   * Search customers by name with server-side filtering
   */
  static async searchCustomers(searchTerm: string, pageSize: number = 100): Promise<PaginatedResponse<Customer>> {
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      params.append('is_active', 'true'); // Only search active customers
      params.append('page_size', pageSize.toString());
      
      const response = await api.get(`/api/customers/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Get customers for autocomplete with search functionality
   * This is optimized for dropdowns with typing search
   */
  static async getCustomersForAutocomplete(searchTerm?: string): Promise<Customer[]> {
    try {
      if (searchTerm && searchTerm.trim()) {
        // Use server-side search for performance
        const result = await this.searchCustomers(searchTerm, 50);
        return result.results;
      } else {
        // Get all active customers if no search term
        const result = await this.getActiveCustomers(1000);
        return result.results;
      }
    } catch (error) {
      console.error('Error fetching customers for autocomplete:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(id: number): Promise<Customer> {
    try {
      const response = await api.get(`/api/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer(customerData: Omit<Customer, 'id' | 'running_balance' | 'created_at' | 'updated_at'>): Promise<Customer> {
    try {
      const response = await api.post('/api/customers/', {
        ...customerData,
        opening_balance: parseFloat(customerData.opening_balance) || 0
      });
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update an existing customer
   */
  static async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer> {
    try {
      const response = await api.put(`/api/customers/${id}/`, customerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(id: number): Promise<void> {
    try {
      await api.delete(`/api/customers/${id}/`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get customer statement with all transactions
   */
  static async getCustomerStatement(customerId: number, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/api/customers/${customerId}/statement/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statement for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default CustomerService;