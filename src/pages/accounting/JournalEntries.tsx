import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  totalAmount: number;
  status: 'posted' | 'draft' | 'cancelled';
  createdBy: string;
}

const mockEntries: JournalEntry[] = [
  { id: '1', number: 'JV-2024-001', date: '2024-03-25', description: 'إثبات رواتب شهر مارس 2024', totalAmount: 45000, status: 'posted', createdBy: 'أحمد محمد' },
  { id: '2', number: 'JV-2024-002', date: '2024-03-26', description: 'سداد فاتورة كهرباء - المكتب الرئيسي', totalAmount: 1200, status: 'posted', createdBy: 'أحمد محمد' },
  { id: '3', number: 'JV-2024-003', date: '2024-03-27', description: 'شراء أجهزة مكتبية جديدة', totalAmount: 8500, status: 'draft', createdBy: 'سارة علي' },
  { id: '4', number: 'JV-2024-004', date: '2024-03-28', description: 'تسوية عهدة موظف', totalAmount: 500, status: 'posted', createdBy: 'أحمد محمد' },
  { id: '5', number: 'JV-2024-005', date: '2024-03-29', description: 'إيرادات مبيعات نقدية', totalAmount: 12500, status: 'posted', createdBy: 'سارة علي' },
];

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">القيود اليومية</h1>
          <p className="text-muted-foreground">تسجيل وإدارة جميع الحركات المالية والقيود المحاسبية.</p>
        </div>
        <Link to="/accounting/journal/new">
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            قيد جديد
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي القيود</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245 قيد</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المرحلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">1,180</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المسودات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">65</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">قيمة العمليات (هذا الشهر)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">342,000 ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث برقم القيد أو الوصف..." 
                className="pr-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                الفترة
              </Button>
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
                <TableHead className="w-[150px]">رقم القيد</TableHead>
                <TableHead className="w-[120px]">التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead>بواسطة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-bold text-primary">{entry.number}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="max-w-md truncate">{entry.description}</TableCell>
                  <TableCell className="text-right font-bold">{entry.totalAmount.toLocaleString()} ر.س</TableCell>
                  <TableCell className="text-center">
                    {entry.status === 'posted' ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        مرحل
                      </Badge>
                    ) : entry.status === 'draft' ? (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                        <Clock className="w-3 h-3" />
                        مسودة
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">ملغى</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.createdBy}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
