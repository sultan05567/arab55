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
  Mail
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  paid: { label: 'مدفوعة', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  issued: { label: 'مرسلة', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  overdue: { label: 'متأخرة', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
  partially_paid: { label: 'مدفوعة جزئياً', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: Clock },
  draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Edit },
  cancelled: { label: 'ملغاة', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
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
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">فواتير المبيعات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة جميع فواتير المبيعات الخاصة بشركتك.</p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center px-4 py-2 gap-3 border shadow-none bg-muted/10 h-11">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-muted-foreground leading-none">تذكير تلقائي</span>
              <span className="text-xs font-medium text-green-500">نشط</span>
            </div>
            <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer opacity-50">
               <div className="absolute left-4 top-0.5 w-3 h-3 bg-white rounded-full transition-all"></div>
            </div>
          </Card>
          <Link to="/sales/new">
            <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              فاتورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المدفوعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.paid.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">غير المدفوعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.unpaid.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المتأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.overdue.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث برقم الفاتورة أو العميل..." 
                className="pr-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {stats.overdue > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-500 border-red-500/20 hover:bg-red-500/5"
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                >
                  {sendingReminders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  إرسال تذكيرات للمتأخرة
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                تصفية
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="w-4 h-4" />
                تصدير
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                طباعة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead 
                  className="w-[150px] cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('number')}
                >
                  <div className="flex items-center">
                    رقم الفاتورة
                    <SortIcon column="number" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    العميل
                    <SortIcon column="customerName" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    التاريخ
                    <SortIcon column="date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">
                    تاريخ الاستحقاق
                    <SortIcon column="dueDate" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end">
                    الإجمالي
                    <SortIcon column="total" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    حالة الدفع
                    <SortIcon column="status" />
                  </div>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => {
                const status = statusConfig[invoice.status] || statusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-bold text-primary">{invoice.number}</TableCell>
                    <TableCell className="font-medium">{invoice.customerName}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="text-right font-bold">{invoice.total.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="outline" className={cn("gap-1.5 px-3 py-1 rounded-full border", status.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </Badge>
                        {invoice.reminderSentAt && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            آخر تذكير: {new Date(invoice.reminderSentAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Printer className="w-4 h-4" />
                            طباعة
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
