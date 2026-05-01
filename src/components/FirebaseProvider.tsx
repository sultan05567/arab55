import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { UserProfile, ModuleKey } from '@/types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  enabledModules: ModuleKey[];
  loading: boolean;
  isAuthReady: boolean;
  hasPermission: (permission: string) => boolean;
  isModuleEnabled: (module: ModuleKey) => boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  profile: null,
  enabledModules: [],
  loading: true,
  isAuthReady: false,
  hasPermission: () => false,
  isModuleEnabled: () => false,
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
          // Fetch user profile
          const profileDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (profileDoc.exists()) {
            const userData = { uid: profileDoc.id, ...profileDoc.data() } as UserProfile;
            setProfile(userData);

            // Fetch enabled modules for the company
            if (userData.companyId) {
              const modulesSnapshot = await getDocs(collection(db, 'companies', userData.companyId, 'modules'));
              const modules = modulesSnapshot.docs
                .filter(doc => doc.data().isEnabled)
                .map(doc => doc.data().moduleKey as ModuleKey);
              setEnabledModules(modules);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile/modules:", error);
        }
      } else {
        setProfile(null);
        setEnabledModules([]);
      }
      
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    if (profile.isOwner) return true;
    return profile.permissions?.includes(permission) || false;
  };

  const isModuleEnabled = (module: ModuleKey): boolean => {
    return enabledModules.includes(module);
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      enabledModules, 
      loading, 
      isAuthReady,
      hasPermission,
      isModuleEnabled
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}
