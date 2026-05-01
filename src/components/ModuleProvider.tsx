import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { moduleService } from '@/services/moduleService';
import { Module } from '@/types';

interface ModuleContextType {
  modules: Module[];
  enabledModuleKeys: string[];
  userPermissions: string[];
  loading: boolean;
  isLoaded: boolean;
}

const ModuleContext = createContext<ModuleContextType>({
  modules: [],
  enabledModuleKeys: [],
  userPermissions: [],
  loading: true,
  isLoaded: false,
});

export const useModules = () => useContext(ModuleContext);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const { profile, user } = useFirebase();
  const [modules, setModules] = useState<Module[]>([]);
  const [enabledModuleKeys, setEnabledModuleKeys] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadDynamicConfig() {
      if (!user) {
        setModules([]);
        setEnabledModuleKeys([]);
        setUserPermissions([]);
        setIsLoaded(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Get all active modules
        const allModules = await moduleService.getActiveModules();
        setModules(allModules);

        if (profile?.companyId) {
          // 2. Get enabled modules for company
          const companyKeys = await moduleService.getCompanyModules(profile.companyId);
          setEnabledModuleKeys(companyKeys);

          // 3. Get permissions for the user's role (from Supabase if role exists there, 
          // or derive from profile role key)
          const permissions = await moduleService.getUserPermissions(profile.role);
          setUserPermissions(permissions);
        }
      } catch (error) {
        console.error('Error loading dynamic modules:', error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    }

    loadDynamicConfig();
  }, [user, profile?.companyId, profile?.role]);

  return (
    <ModuleContext.Provider value={{
      modules,
      enabledModuleKeys,
      userPermissions,
      loading,
      isLoaded
    }}>
      {children}
    </ModuleContext.Provider>
  );
}
