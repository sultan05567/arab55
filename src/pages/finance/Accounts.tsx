import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  History,
  ArrowRightLeft,
  CreditCard,
  Banknote
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

interface FinanceAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash';
  accountNumber?: string;
  bankName?: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
}

const mockFinanceAccounts: FinanceAccount[] = [
  { id: '1', name: 'حساب الراجحي الجاري', type: 'bank', accountNumber: 'SA1234567890123456789012', bankName: 'مصرف الراجحي', balance: 250000, currency: 'ر.س', status: 'active' },
  { id: '2', name: 'حساب الأهلي للمشتريات', type: 'bank', accountNumber: 'SA9876543210987654321098', bankName: 'البنك الأهلي السعودي', balance: 45000, currency: 'ر.س', status: 'active' },
  { id: '3', name: 'خزينة المكتب الرئيسي', type: 'cash', balance: 12500, currency: 'ر.س', status: 'active' },
  { id: '4', name: 'خزينة فرع جدة', type: 'cash', balance: 8400, currency: 'ر.س', status: 'active' },
];

export default function FinanceAccounts() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">البنوك والخزينة</h1>
          <p className="text-muted-foreground">إدارة الحسابات البنكية، الخزائن النقدية، والتدفقات المالية.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            تحويل بين الحسابات
          </Button>
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            إضافة حساب جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">إجمالي السيولة النقدية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">315,900 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-green-500 font-bold">+4.2%</span>
              منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">رصيد البنوك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">295,000 ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">رصيد الخزائن</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20,900 ر.س</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockFinanceAccounts.map((account) => (
          <Card key={account.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  account.type === 'bank' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                )}>
                  {account.type === 'bank' ? <Building2 className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="p-2 hover:bg-muted rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2">
                      <History className="w-4 h-4" />
                      كشف حساب
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      تحويل مالي
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <Plus className="w-4 h-4 rotate-45" />
                      تعطيل الحساب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-lg">{account.name}</h3>
                {account.type === 'bank' && (
                  <p className="text-xs text-muted-foreground font-mono truncate">{account.accountNumber}</p>
                )}
                {account.type === 'cash' && (
                  <p className="text-xs text-muted-foreground">نقد في الخزينة</p>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الرصيد الحالي</p>
                  <p className="text-2xl font-black">{account.balance.toLocaleString()} <span className="text-sm font-normal">{account.currency}</span></p>
                </div>
                <Badge className={cn(
                  "rounded-full",
                  account.status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                )}>
                  {account.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle className="text-lg">آخر الحركات المالية</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحساب</TableHead>
                <TableHead>البيان</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-center">النوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { date: '2024-03-25', account: 'حساب الراجحي', desc: 'تحصيل فاتورة INV-001', amount: 12500, type: 'in' },
                { date: '2024-03-24', account: 'خزينة المكتب', desc: 'شراء قرطاسية ومستلزمات', amount: -450, type: 'out' },
                { date: '2024-03-23', account: 'حساب الأهلي', desc: 'سداد فاتورة مورد BILL-002', amount: -12000, type: 'out' },
                { date: '2024-03-22', account: 'حساب الراجحي', desc: 'إيداع نقدي من الخزينة', amount: 5000, type: 'in' },
              ].map((tx, i) => (
                <TableRow key={i}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className="font-medium">{tx.account}</TableCell>
                  <TableCell>{tx.desc}</TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    tx.type === 'in' ? "text-green-500" : "text-red-500"
                  )}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn(
                      "rounded-full",
                      tx.type === 'in' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {tx.type === 'in' ? 'إيداع' : 'سحب'}
                    </Badge>
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
