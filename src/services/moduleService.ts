import { supabase } from '@/lib/supabase';
import { Module, CompanyModule, Permission } from '@/types';

export const moduleService = {
  async getActiveModules(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('order_number');

    if (error) throw error;
    return data || [];
  },

  async getCompanyModules(companyId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('company_modules')
      .select('module_key')
      .eq('company_id', companyId)
      .eq('is_enabled', true);

    if (error) throw error;
    return (data || []).map(m => m.module_key);
  },

  async getUserPermissions(roleKey: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_key')
      .eq('role_key', roleKey);

    if (error) throw error;
    return (data || []).map(p => p.permission_key);
  }
};
