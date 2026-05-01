import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  Wallet,
  Briefcase,
  Users2,
  Receipt,
  Monitor
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
  { icon: Monitor, label: 'الكاشير (POS)', path: '/pos' },
  { 
    icon: ShoppingCart, 
    label: 'المبيعات', 
    path: '/sales',
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
    subItems: [
      { label: 'فواتير المشتريات', path: '/purchases' },
      { label: 'أوامر الشراء', path: '/purchases/orders' },
      { label: 'الموردين', path: '/crm' },
    ]
  },
  { icon: Users, label: 'العملاء والموردين', path: '/crm' },
  { 
    icon: Package, 
    label: 'المخزون', 
    path: '/inventory',
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
    subItems: [
      { label: 'دليل الحسابات', path: '/accounting' },
      { label: 'الالقيود اليومية', path: '/accounting/journal' },
      { label: 'ميزان المراجعة', path: '/accounting/trial-balance' },
    ]
  },
  { icon: Briefcase, label: 'المشاريع', path: '/projects' },
  { 
    icon: Users2, 
    label: 'الموارد البشرية', 
    path: '/hr',
    subItems: [
      { label: 'الموظفين', path: '/hr' },
      { label: 'الرواتب', path: '/hr/payroll' },
      { label: 'الحضور والانصراف', path: '/hr/attendance' },
    ]
  },
  { icon: BarChart3, label: 'التقارير', path: '/reports' },
  { icon: Settings, label: 'الإعدادات', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-l border-border flex flex-col h-full transition-all duration-300 ease-in-out">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
          A
        </div>
        <span className="text-2xl font-bold tracking-tight text-primary">ARAB</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const hasSubItems = 'subItems' in item;

          return (
            <div key={item.path} className="space-y-1">
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary-foreground" : "group-hover:text-primary"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
              
              {isActive && hasSubItems && (
                <div className="mr-9 space-y-1 mt-1 border-r-2 border-primary/20 pr-4 animate-in slide-in-from-right-2 duration-300">
                  {item.subItems?.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={cn(
                        "block py-2 text-sm transition-colors",
                        location.pathname === sub.path
                          ? "text-primary font-bold"
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

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
