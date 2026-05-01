import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Receipt,
  Loader2,
  Monitor,
  AlertCircle,
  Calendar,
  Wallet,
  Plus
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Invoice } from '@/types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useFirebase();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const invoicesPath = `companies/${profile.companyId}/invoices`;
    const invoicesQuery = query(
      collection(db, invoicesPath),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const productsPath = 'products';
    const productsQuery = query(
      collection(db, productsPath),
      where('companyId', '==', profile.companyId)
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, invoicesPath);
    });

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, productsPath);
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeProducts();
    };
  }, [profile?.companyId]);

  const lowStockCount = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;
  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'overdue').length;

  const stats = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.total, 0),
    chartData: [
      { name: 'يناير', sales: 4200, expenses: 2100 },
      { name: 'فبراير', sales: 3800, expenses: 2400 },
      { name: 'مارس', sales: 5200, expenses: 2800 },
      { name: 'أبريل', sales: 4800, expenses: 2600 },
      { name: 'مايو', sales: 6100, expenses: 3100 },
      { name: 'يونيو', sales: 7500, expenses: 3400 },
    ]
  };

  const kpis = [
    { title: 'إجمالي المبيعات', value: `${stats.totalSales.toLocaleString()} ر.س`, change: '+12.5%', icon: ShoppingCart, color: 'primary', trend: 'up' },
    { title: 'صافي الأرباح', value: `${(stats.totalSales * 0.45).toLocaleString()} ر.س`, change: '+18.4%', icon: TrendingUp, color: 'success', trend: 'up' },
    { title: 'المصروفات', value: '3,450 ر.س', change: '-2.1%', icon: TrendingDown, color: 'destructive', trend: 'down' },
    { title: 'تنبيهات المخزون', value: `${lowStockCount + outOfStockCount}`, change: 'يحتاج انتباه', icon: Package, color: 'warning', trend: 'down' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">مرحباً بكل نمو! 👋</h1>
          <p className="text-slate-500 font-medium">إليك ملخص أداء متجرك <span className="text-primary font-bold">QAYD</span> لليوم.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pos">
            <Button size="lg" className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-12">
              <Monitor className="w-5 h-5" />
              نظام الكاشير
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="rounded-2xl gap-2 glass h-12">
            <Plus className="w-5 h-5" />
            فاتورة جديدة
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-none shadow-sm card-hover relative overflow-hidden group">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors shrink-0",
                    kpi.color === 'primary' ? "bg-primary/10 text-primary" :
                    kpi.color === 'success' ? "bg-emerald-50 text-emerald-600" :
                    kpi.color === 'destructive' ? "bg-rose-50 text-rose-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    kpi.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">{kpi.title}</p>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</h2>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Actions */}
      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-sm h-[500px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-xl font-black tracking-tight">إحصائيات النمو</CardTitle>
              <CardDescription className="text-slate-500 mt-1">مقارنة المبيعات والمصروفات خلال 6 أشهر</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-primary bg-primary/5">مبيعات</Button>
              <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-slate-500">مصروفات</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 13, fontWeight: 600}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 13, fontWeight: 600}}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5'}}
                  contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={4}
                  name="المبيعات"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black">أحدث العمليات</CardTitle>
              <CardDescription>آخر 5 فواتير تم إصدارها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {invoices.length > 0 ? invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 tracking-tight truncate">{invoice.customerName}</p>
                      <p className="text-[11px] font-bold text-slate-400">FA-{invoice.number}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">{invoice.total.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-[10px] h-5 rounded-full bg-emerald-50 text-emerald-600 border-none">ناجحة</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-400 font-medium">لا توجد فواتير حالياً</div>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-6 rounded-xl font-bold text-primary hover:bg-primary/5">
                عرض تقرير المبيعات الكامل
              </Button>
            </CardContent>
          </Card>

          {/* Quick Alerts */}
          <div className="space-y-4">
            {lowStockCount > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                <div className="p-2 rounded-2xl bg-amber-100 text-amber-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-900">تنبيه المخزون المنخفض</h4>
                  <p className="text-xs text-amber-700 font-medium mt-1">هناك {lowStockCount} منتجات قريبة من الانتهاء</p>
                </div>
              </div>
            )}
            
            {overdueInvoicesCount > 0 && (
              <div className="p-4 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-900">فواتير متأخرة الدفع</h4>
                  <p className="text-xs text-rose-700 font-medium mt-1">تحتاج متابعة {overdueInvoicesCount} فواتير</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
