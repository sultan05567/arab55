import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/sales/Invoices';
import CreateInvoice from './pages/sales/CreateInvoice';
import Bills from './pages/purchases/Bills';
import FinanceAccounts from './pages/finance/Accounts';
import Employees from './pages/hr/Employees';
import Contacts from './pages/crm/Contacts';
import Products from './pages/inventory/Products';
import InventoryAdjustments from './pages/inventory/InventoryAdjustments';
import CreateAdjustment from './pages/inventory/CreateAdjustment';
import ChartOfAccounts from './pages/accounting/ChartOfAccounts';
import JournalEntries from './pages/accounting/JournalEntries';
import CreateJournalEntry from './pages/accounting/CreateJournalEntry';
import PointOfSale from './pages/pos/PointOfSale';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import SettingsIndex from './pages/settings/SettingsIndex';
import ModulesSettings from './pages/settings/ModulesSettings';
import UsersSettings from './pages/settings/UsersSettings';
import Forbidden from './pages/Forbidden';
import { Toaster } from 'sonner';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { ModuleKey } from './types';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import { Layout, Users } from 'lucide-react';
import { Button } from './components/ui/button';

function ProtectedRoute({ 
  children, 
  module, 
  permission 
}: { 
  children: React.ReactNode, 
  module?: ModuleKey, 
  permission?: string 
}) {
  const { user, profile, loading, isModuleEnabled, hasPermission, isAuthReady } = useFirebase();
  const location = useLocation();
  const [isOnboardingCheckDone, setIsOnboardingCheckDone] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || !profile) return;
      
      try {
        const companyDoc = await getDoc(doc(db, 'companies', profile.companyId));
        if (companyDoc.exists()) {
          setNeedsOnboarding(!companyDoc.data().onboardingCompleted);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsOnboardingCheckDone(true);
      }
    };

    if (isAuthReady && user && profile) {
      checkOnboarding();
    } else if (isAuthReady && !user) {
      setIsOnboardingCheckDone(true);
    }
  }, [user, profile, isAuthReady]);

  if (loading || !isAuthReady || (user && !isOnboardingCheckDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  if (!needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" />;
  }

  // Check module
  if (module && !isModuleEnabled(module)) {
    return <Navigate to="/forbidden" />;
  }

  // Check permission
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/forbidden" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute module="dashboard" permission="dashboard.view">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute module="pos" permission="pos.view">
                <MainLayout hPadding={false}>
                  <PointOfSale />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <ProtectedRoute module="invoices" permission="sales.view">
                <MainLayout>
                  <Invoices />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales/new" 
            element={
              <ProtectedRoute module="invoices" permission="sales.create">
                <MainLayout>
                  <CreateInvoice />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/purchases" 
            element={
              <ProtectedRoute module="suppliers" permission="purchases.view">
                <MainLayout>
                  <Bills />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute module="receipts" permission="finance.view">
                <MainLayout>
                  <FinanceAccounts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hr" 
            element={
              <ProtectedRoute module="hr" permission="hr.view">
                <MainLayout>
                  <Employees />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crm" 
            element={
              <ProtectedRoute module="customers" permission="customers.view">
                <MainLayout>
                  <Contacts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute module="inventory" permission="inventory.view">
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/adjustments" 
            element={
              <ProtectedRoute module="inventory" permission="inventory.view">
                <MainLayout>
                  <InventoryAdjustments />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/adjustments/new" 
            element={
              <ProtectedRoute module="inventory" permission="inventory.view">
                <MainLayout>
                  <CreateAdjustment />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute module="accounting" permission="accounting.view">
                <MainLayout>
                  <ChartOfAccounts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting/journal" 
            element={
              <ProtectedRoute module="accounting" permission="accounting.view">
                <MainLayout>
                  <JournalEntries />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting/journal/new" 
            element={
              <ProtectedRoute module="accounting" permission="accounting.view">
                <MainLayout>
                  <CreateJournalEntry />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute module="projects" permission="projects.view">
                <MainLayout>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">وحدة المشاريع</h1>
                    <p className="text-muted-foreground">قيد التطوير...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute module="reports" permission="reports.view">
                <MainLayout>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">التقارير</h1>
                    <p className="text-muted-foreground">قيد التطوير...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute permission="settings.view">
                <SettingsIndex />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings/modules" 
            element={
              <ProtectedRoute permission="settings.view">
                <ModulesSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings/users" 
            element={
              <ProtectedRoute permission="users.manage">
                <UsersSettings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}
