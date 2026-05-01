import { useState, Fragment } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText,
  FolderOpen,
  Folder,
  ArrowRightLeft
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
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  level: number;
  isParent: boolean;
  children?: Account[];
  expanded?: boolean;
}

const mockAccounts: Account[] = [
  {
    id: '1',
    code: '1',
    name: 'الأصول',
    type: 'asset',
    balance: 500000,
    level: 1,
    isParent: true,
    expanded: true,
    children: [
      {
        id: '11',
        code: '11',
        name: 'الأصول المتداولة',
        type: 'asset',
        balance: 300000,
        level: 2,
        isParent: true,
        expanded: true,
        children: [
          { id: '111', code: '111', name: 'الصندوق', type: 'asset', balance: 50000, level: 3, isParent: false },
          { id: '112', code: '112', name: 'البنك', type: 'asset', balance: 250000, level: 3, isParent: false },
        ]
      },
      {
        id: '12',
        code: '12',
        name: 'الأصول الثابتة',
        type: 'asset',
        balance: 200000,
        level: 2,
        isParent: true,
        children: [
          { id: '121', code: '121', name: 'الأراضي', type: 'asset', balance: 100000, level: 3, isParent: false },
          { id: '122', code: '122', name: 'المباني', type: 'asset', balance: 100000, level: 3, isParent: false },
        ]
      }
    ]
  },
  {
    id: '2',
    code: '2',
    name: 'الخصوم',
    type: 'liability',
    balance: 150000,
    level: 1,
    isParent: true,
    children: [
      { id: '21', code: '21', name: 'الدائنون', type: 'liability', balance: 150000, level: 2, isParent: false },
    ]
  },
  {
    id: '3',
    code: '3',
    name: 'حقوق الملكية',
    type: 'equity',
    balance: 350000,
    level: 1,
    isParent: true,
    children: [
      { id: '31', code: '31', name: 'رأس المال', type: 'equity', balance: 350000, level: 2, isParent: false },
    ]
  },
  {
    id: '4',
    code: '4',
    name: 'الإيرادات',
    type: 'revenue',
    balance: 120000,
    level: 1,
    isParent: true,
    children: [
      { id: '41', code: '41', name: 'مبيعات السلع', type: 'revenue', balance: 120000, level: 2, isParent: false },
    ]
  },
  {
    id: '5',
    code: '5',
    name: 'المصروفات',
    type: 'expense',
    balance: 45000,
    level: 1,
    isParent: true,
    children: [
      { id: '51', code: '51', name: 'الرواتب والأجور', type: 'expense', balance: 45000, level: 2, isParent: false },
    ]
  }
];

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    const updateExpanded = (list: Account[]): Account[] => {
      return list.map(acc => {
        if (acc.id === id) {
          return { ...acc, expanded: !acc.expanded };
        }
        if (acc.children) {
          return { ...acc, children: updateExpanded(acc.children) };
        }
        return acc;
      });
    };
    setAccounts(updateExpanded(accounts));
  };

  const renderAccountRow = (account: Account) => {
    const hasChildren = account.children && account.children.length > 0;
    const typeColors = {
      asset: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      liability: 'bg-red-500/10 text-red-500 border-red-500/20',
      equity: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      revenue: 'bg-green-500/10 text-green-500 border-green-500/20',
      expense: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };

    const typeLabels = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق ملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات',
    };

    return (
      <Fragment key={account.id}>
        <TableRow className={cn(
          "hover:bg-muted/50 transition-colors",
          account.level === 1 && "bg-muted/20 font-bold"
        )}>
          <TableCell className="font-mono text-sm">{account.code}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingRight: `${(account.level - 1) * 24}px` }}>
              {account.isParent ? (
                <button 
                  onClick={() => toggleExpand(account.id)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  {account.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-6" />
              )}
              {account.isParent ? (
                account.expanded ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground" />
              )}
              <span>{account.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={cn("rounded-full", typeColors[account.type])}>
              {typeLabels[account.type]}
            </Badge>
          </TableCell>
          <TableCell className="text-right font-bold">
            {account.balance.toLocaleString()} ر.س
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
                  <Plus className="w-4 h-4" />
                  إضافة حساب فرعي
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  عرض الأستاذ العام
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
        {account.expanded && account.children && account.children.map(child => renderAccountRow(child))}
      </Fragment>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">دليل الحسابات</h1>
          <p className="text-muted-foreground">إدارة شجرة الحسابات والهيكل المالي للشركة.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            استيراد من Excel
          </Button>
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            إضافة حساب رئيسي
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">إجمالي الأصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500,000 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">إجمالي الخصوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150,000 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">صافي الدخل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75,000 ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث برقم الحساب أو الاسم..." 
                className="pr-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">طي الكل</Button>
              <Button variant="outline" size="sm">توسيع الكل</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px]">رقم الحساب</TableHead>
                <TableHead>اسم الحساب</TableHead>
                <TableHead className="w-[150px]">النوع</TableHead>
                <TableHead className="text-right w-[200px]">الرصيد</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(account => renderAccountRow(account))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
