import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { Toaster } from 'sonner';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
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
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute>
                <MainLayout hPadding={false}>
                  <PointOfSale />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Invoices />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales/new" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateInvoice />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/purchases" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Bills />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FinanceAccounts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hr" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Employees />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crm" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Contacts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/adjustments" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InventoryAdjustments />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/adjustments/new" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateAdjustment />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChartOfAccounts />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting/journal" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <JournalEntries />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting/journal/new" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateJournalEntry />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
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
              <ProtectedRoute>
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
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">الإعدادات</h1>
                    <p className="text-muted-foreground">قيد التطوير...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}
