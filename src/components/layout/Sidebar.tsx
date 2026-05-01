import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Wallet,
  Briefcase,
  Users2,
  Receipt,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFirebase } from '../FirebaseProvider';
import { ModuleKey } from '@/types';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  module?: ModuleKey;
  permission?: string;
  subItems?: { label: string; path: string; permission?: string }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard', module: 'dashboard', permission: 'dashboard.view' },
  { icon: Monitor, label: 'الكاشير (POS)', path: '/pos', module: 'pos', permission: 'pos.view' },
  { 
    icon: ShoppingCart, 
    label: 'المبيعات', 
    path: '/sales',
    module: 'invoices',
    permission: 'sales.view',
    subItems: [
      { label: 'الفواتير', path: '/sales' },
      { label: 'عروض الأسعار', path: '/sales/quotations' },
      { label: 'المرتجعات', path: '/sales/returns' },
    ]
  },
  { 
    icon: Receipt, 
    label: 'المشتريات', 
    path: '/purchases',
    module: 'suppliers',
    permission: 'purchases.view',
    subItems: [
      { label: 'فواتير المشتريات', path: '/purchases' },
      { label: 'أوامر الشراء', path: '/purchases/orders' },
      { label: 'الموردين', path: '/crm' },
    ]
  },
  { icon: Users, label: 'العملاء والموردين', path: '/crm', module: 'customers', permission: 'customers.view' },
  { 
    icon: Package, 
    label: 'المخزون', 
    path: '/inventory',
    module: 'inventory',
    permission: 'inventory.view',
    subItems: [
      { label: 'المنتجات', path: '/inventory' },
      { label: 'تسويات المخزون', path: '/inventory/adjustments' },
      { label: 'المستودعات', path: '/inventory/warehouses' },
      { label: 'حركات المخزون', path: '/inventory/movements' },
    ]
  },
  { 
    icon: Wallet, 
    label: 'المالية', 
    path: '/finance',
    module: 'receipts',
    permission: 'finance.view',
    subItems: [
      { label: 'البنوك والخزينة', path: '/finance' },
      { label: 'سندات القبض', path: '/finance/receipts' },
      { label: 'سندات الصرف', path: '/finance/payments' },
    ]
  },
  { 
    icon: FileText, 
    label: 'المحاسبة', 
    path: '/accounting',
    module: 'accounting',
    permission: 'accounting.view',
    subItems: [
      { label: 'دليل الحسابات', path: '/accounting' },
      { label: 'القيود اليومية', path: '/accounting/journal' },
      { label: 'ميزان المراجعة', path: '/accounting/trial-balance' },
    ]
  },
  { icon: Briefcase, label: 'المشاريع', path: '/projects', module: 'projects', permission: 'projects.view' },
  { 
    icon: Users2, 
    label: 'الموارد البشرية', 
    path: '/hr',
    module: 'hr',
    permission: 'hr.view',
    subItems: [
      { label: 'الموظفين', path: '/hr' },
      { label: 'الرواتب', path: '/hr/payroll' },
      { label: 'الحضور والانصراف', path: '/hr/attendance' },
    ]
  },
  { icon: BarChart3, label: 'التقارير', path: '/reports', module: 'reports', permission: 'reports.view' },
  { icon: Settings, label: 'الإعدادات', path: '/settings', permission: 'settings.view' },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isModuleEnabled, hasPermission } = useFirebase();

  const filteredMenu = menuItems.filter(item => {
    // If it's a module-linked item, check if module is enabled
    if (item.module && !isModuleEnabled(item.module)) return false;
    
    // Check if user has permission
    if (item.permission && !hasPermission(item.permission)) return false;

    return true;
  });

  return (
    <aside className={cn(
      "bg-card border-l border-border flex flex-col h-full transition-all duration-500 ease-in-out relative z-40 group/sidebar",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* ... toggle button ... */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md z-50 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "p-6 flex items-center gap-3 transition-all duration-300",
        isCollapsed && "px-4 justify-center"
      )}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 shrink-0">
          Q
        </div>
        {!isCollapsed && <span className="text-2xl font-black tracking-tighter text-primary animate-in fade-in duration-500">QAYD</span>}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {filteredMenu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const hasSubItems = 'subItems' in item;

          return (
            <div key={item.path} className="space-y-1">
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors shrink-0",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )} />
                {!isCollapsed && <span className="font-semibold text-sm animate-in fade-in duration-500">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full" />
                )}
              </Link>
              
              {isActive && hasSubItems && !isCollapsed && (
                <div className="mr-8 space-y-1 mt-1 border-r border-muted pr-4 animate-in slide-in-from-top-1 duration-300">
                  {item.subItems?.filter(sub => !sub.permission || hasPermission(sub.permission)).map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={cn(
                        "block py-1.5 text-[13px] font-medium transition-colors",
                        location.pathname === sub.path
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="px-6 py-4 mx-3 mb-2 rounded-2xl bg-slate-50 border border-slate-100 group/command cursor-pointer transition-all hover:border-primary/20" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/command:text-primary transition-colors">البحث الذكي</span>
            <div className="flex items-center gap-0.5">
              <span className="p-0.5 px-1 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-400">CTRL</span>
              <span className="p-0.5 px-1 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-400">K</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 line-clamp-1">ابحث عن أي شيء في قيد...</p>
        </div>
      )}

      <div className="p-4 border-t border-border mt-auto">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200",
          isCollapsed && "justify-center"
        )}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-semibold text-sm animate-in fade-in duration-500">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
