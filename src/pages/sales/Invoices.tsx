import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileDown, 
  Printer,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Receipt
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Invoice } from '@/types';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { cn } from '@/lib/utils';
import { sendOverdueReminders } from '@/services/reminderService';
import { toast } from 'sonner';

const statusConfig = {
  paid: { label: 'مدفوعة', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  issued: { label: 'مرسلة', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
  overdue: { label: 'متأخرة', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertCircle },
  partially_paid: { label: 'مدفوعة جزئياً', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
  draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Edit },
  cancelled: { label: 'ملغاة', color: 'bg-slate-50 text-slate-400 border-slate-200', icon: XCircle },
};

export default function Invoices() {
  const { profile } = useFirebase();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice | ''; direction: 'asc' | 'desc' | '' }>({ key: '', direction: '' });

  useEffect(() => {
    if (!profile?.companyId) return;

    const path = `companies/${profile.companyId}/invoices`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [profile?.companyId]);

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (key: keyof Invoice) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: keyof Invoice }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-3 w-3 text-primary" /> 
      : <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
  };

  const handleSendReminders = async () => {
    if (!profile?.companyId) return;
    
    setSendingReminders(true);
    try {
      const result = await sendOverdueReminders(profile.companyId);
      if (result.count > 0) {
        toast.success(`تم إرسال ${result.count} تذكير بنجاح`);
      } else {
        toast.info('لا توجد فواتير متأخرة تحتاج لتذكير');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال التذكيرات');
    } finally {
      setSendingReminders(false);
    }
  };

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    unpaid: invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.total, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">فواتير المبيعات</h1>
          <p className="text-slate-500 font-medium">إدارة ومتابعة جميع فواتير المبيعات الخاصة بشركتك في مكان واحد.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl gap-2 h-12 font-bold border-slate-200"
            onClick={handleSendReminders}
            disabled={sendingReminders}
          >
            {sendingReminders ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 text-primary" />}
            إرسال التذكيرات
          </Button>
          <Link to="/sales/new">
            <Button size="lg" className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-12 font-bold">
              <Plus className="w-5 h-5" />
              إنشاء فاتورة
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'إجمالي الفواتير', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'المدفوعة', value: stats.paid, color: 'text-emerald-600', bg: 'bg-emerald-50/30' },
          { label: 'غير المدفوعة', value: stats.unpaid, color: 'text-amber-600', bg: 'bg-amber-50/30' },
          { label: 'المتأخرة', value: stats.overdue, color: 'text-rose-600', bg: 'bg-rose-50/30' },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm card-hover", stat.bg)}>
            <CardContent className="p-6">
              <p className="text-sm font-bold text-slate-500 mb-2">{stat.label}</p>
              <div className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value.toLocaleString()} ر.س</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="بحث برقم الفاتورة أو العميل..." 
                className="pr-10 bg-slate-50 border-none rounded-xl h-11 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 border-slate-200">
                <Filter className="w-4 h-4" />
                تصفية
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 border-slate-200">
                <FileDown className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead 
                  className="h-14 cursor-pointer hover:text-primary transition-colors font-black text-slate-800"
                  onClick={() => handleSort('number')}
                >
                  <div className="flex items-center">
                    رقم الفاتورة
                    <SortIcon column="number" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors font-black text-slate-800"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    العميل
                    <SortIcon column="customerName" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors font-black text-slate-800"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    التاريخ
                    <SortIcon column="date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary transition-colors font-black text-slate-800 uppercase text-[11px]"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">
                    الاستحقاق
                    <SortIcon column="dueDate" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:text-primary transition-colors font-black text-slate-800"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end">
                    الإجمالي
                    <SortIcon column="total" />
                  </div>
                </TableHead>
                <TableHead className="text-center font-black text-slate-800">الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={invoice.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="font-black text-primary py-5">#{invoice.number}</TableCell>
                    <TableCell className="font-bold text-slate-700">{invoice.customerName}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{invoice.date}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{invoice.dueDate}</TableCell>
                    <TableCell className="text-right font-black text-slate-900">{invoice.total.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="outline" className={cn("gap-1.5 px-3 py-1 rounded-full border-none font-bold text-[11px]", status.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </Badge>
                        {invoice.reminderSentAt && (
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            تم التذكير {new Date(invoice.reminderSentAt).toLocaleDateString('ar-SA')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl opacity-0 group-hover:opacity-100 transition-opacity")}>
                          <MoreHorizontal className="w-5 h-5 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 shadow-xl shadow-slate-200/50">
                          <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                            <Eye className="w-4 h-4 text-slate-400" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                            <Printer className="w-4 h-4 text-slate-400" />
                            طباعة الفاتورة
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                            حذف الفاتورة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {sortedInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Receipt className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900">لا توجد فواتير</h3>
              <p className="text-slate-500 font-medium max-w-[250px] mx-auto">ابدأ بإصدار أول فاتورة مبيعات لعملائك الآن.</p>
              <Link to="/sales/new" className="mt-6">
                <Button className="rounded-xl gap-2 font-bold">
                  <Plus className="w-5 h-5" />
                  إنشاء فاتورة
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
