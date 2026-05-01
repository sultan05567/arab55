import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Receipt,
  Loader2,
  Monitor
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '@/components/ui/button';
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

  const stats = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.total, 0),
    // For demo purposes, we'll use some static data mixed with real data for charts
    chartData: [
      { name: 'يناير', sales: 4000, expenses: 2400 },
      { name: 'فبراير', sales: 3000, expenses: 1398 },
      { name: 'مارس', sales: 2000, expenses: 9800 },
      { name: 'أبريل', sales: 2780, expenses: 3908 },
      { name: 'مايو', sales: 1890, expenses: 4800 },
      { name: 'يونيو', sales: 2390, expenses: 3800 },
    ]
  };

  const kpis = [
    { title: 'إجمالي المبيعات', value: `${stats.totalSales.toLocaleString()} ر.س`, change: '+12.5%', icon: ShoppingCart, color: 'text-primary', trend: 'up' },
    { title: 'تنبيهات المخزون', value: `${lowStockCount + outOfStockCount} تنبيه`, change: lowStockCount > 0 ? 'مخزون منخفض' : 'المخزون جيد', icon: Package, color: lowStockCount > 0 ? 'text-orange-500' : 'text-green-500', trend: lowStockCount > 0 ? 'down' : 'up' },
    { title: 'صافي الأرباح', value: `${stats.totalSales.toLocaleString()} ر.س`, change: '+18.4%', icon: TrendingUp, color: 'text-green-500', trend: 'up' },
    { title: 'المصروفات', value: '0 ر.س', change: '0%', icon: TrendingDown, color: 'text-red-500', trend: 'down' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك مجدداً، إليك نظرة عامة على أداء شركتك اليوم.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/pos">
            <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Monitor className="w-4 h-4" />
              الذهاب للكاشير (POS)
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            آخر 30 يوم
          </Button>
          <Button className="gap-2">
            <DollarSign className="w-4 h-4" />
            إنشاء فاتورة
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <div className={cn("p-2 rounded-lg bg-muted/50", kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{kpi.value}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn("text-xs font-medium", kpi.trend === 'up' ? "text-green-500" : "text-red-500")}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>تحليل المبيعات والمصروفات</CardTitle>
            <CardDescription>مقارنة شهرية للأداء المالي خلال النصف الأول من العام.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px'}}
                  itemStyle={{fontSize: '12px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={3}
                  name="المبيعات"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  fill="transparent" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="المصروفات"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>أحدث العمليات</CardTitle>
            <CardDescription>آخر 5 حركات تمت على النظام.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {invoices.length > 0 ? invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">فاتورة مبيعات #{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{invoice.total.toLocaleString()} ر.س</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-muted-foreground">
                  لا توجد عمليات حديثة
                </div>
              )}
            </div>
            <Link to="/sales">
              <Button variant="ghost" className="w-full mt-6 text-primary hover:text-primary hover:bg-primary/5">
                عرض جميع العمليات
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
