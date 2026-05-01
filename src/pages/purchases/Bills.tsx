import { useState } from 'react';
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
import { cn } from '@/lib/utils';

interface Bill {
  id: string;
  number: string;
  supplierName: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
}

const mockBills: Bill[] = [
  { id: '1', number: 'BILL-2024-001', supplierName: 'شركة التقنية الحديثة', date: '2024-03-10', dueDate: '2024-03-25', total: 5000, status: 'paid' },
  { id: '2', number: 'BILL-2024-002', supplierName: 'مؤسسة النور للمقاولات', date: '2024-03-15', dueDate: '2024-04-15', total: 12000, status: 'pending' },
  { id: '3', number: 'BILL-2024-003', supplierName: 'شركة التوريدات العالمية', date: '2024-03-20', dueDate: '2024-03-22', total: 3500, status: 'overdue' },
  { id: '4', number: 'BILL-2024-004', supplierName: 'مطاعم السعادة', date: '2024-03-22', dueDate: '2024-04-22', total: 1500, status: 'pending' },
  { id: '5', number: 'BILL-2024-005', supplierName: 'مكتبة البيان', date: '2024-03-25', dueDate: '2024-04-25', total: 800, status: 'draft' },
];

const statusConfig = {
  paid: { label: 'مدفوعة', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  pending: { label: 'بانتظار الدفع', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  overdue: { label: 'متأخرة', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
  draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Edit },
};

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">فواتير المشتريات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة جميع فواتير الموردين والمصروفات.</p>
        </div>
        <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          فاتورة مشتريات جديدة
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22,800 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المدفوعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">5,000 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">بانتظار الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">14,300 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المتأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3,500 ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث برقم الفاتورة أو المورد..." 
                className="pr-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                تصفية
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[150px]">رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBills.map((bill) => {
                const status = statusConfig[bill.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={bill.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-bold text-primary">{bill.number}</TableCell>
                    <TableCell className="font-medium">{bill.supplierName}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell className="text-right font-bold">{bill.total.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("gap-1.5 px-3 py-1 rounded-full border", status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </Badge>
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
