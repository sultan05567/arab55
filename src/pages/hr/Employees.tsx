import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Shield
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'أحمد محمد', role: 'مدير مالي', department: 'المالية', email: 'ahmed@arab.com', phone: '0501112223', joinDate: '2023-01-15', salary: 15000, status: 'active' },
  { id: '2', name: 'سارة علي', role: 'محاسب أول', department: 'المالية', email: 'sara@arab.com', phone: '0503334445', joinDate: '2023-03-20', salary: 12000, status: 'active' },
  { id: '3', name: 'خالد حسن', role: 'مدير مبيعات', department: 'المبيعات', email: 'khaled@arab.com', phone: '0556667778', joinDate: '2023-06-10', salary: 14000, status: 'active' },
  { id: '4', name: 'ليلى يوسف', role: 'أخصائي موارد بشرية', department: 'الموارد البشرية', email: 'laila@arab.com', phone: '0568889990', joinDate: '2023-09-05', salary: 10000, status: 'on_leave' },
  { id: '5', name: 'عمر إبراهيم', role: 'أمين مستودع', department: 'المخزون', email: 'omar@arab.com', phone: '0542223334', joinDate: '2024-01-10', salary: 8000, status: 'active' },
];

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الموظفين</h1>
          <p className="text-muted-foreground">إدارة بيانات الموظفين، الرواتب، والهيكل التنظيمي.</p>
        </div>
        <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          إضافة موظف جديد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 موظف</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">على رأس العمل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">22</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">في إجازة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">2</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">185,000 ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث بالاسم، الوظيفة، أو القسم..." 
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
                <Shield className="w-4 h-4" />
                الصلاحيات
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>الوظيفة والقسم</TableHead>
                <TableHead>معلومات التواصل</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead className="text-right">الراتب الأساسي</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold">{emp.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{emp.role}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {emp.department}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {emp.email}
                      </p>
                      <p className="text-xs flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {emp.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {emp.joinDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {emp.salary.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "rounded-full",
                      emp.status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      emp.status === 'on_leave' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {emp.status === 'active' ? 'نشط' : emp.status === 'on_leave' ? 'في إجازة' : 'مستقيل'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <User className="w-4 h-4" />
                          الملف الشخصي
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <DollarSign className="w-4 h-4" />
                          كشف الراتب
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                          إنهاء الخدمة
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
