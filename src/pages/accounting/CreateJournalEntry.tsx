import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ArrowRight,
  Calculator,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EntryLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export default function CreateJournalEntry() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<EntryLine[]>([
    { id: '1', accountId: '', description: '', debit: 0, credit: 0 },
    { id: '2', accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Math.random().toString(), accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(lines.filter(line => line.id !== id));
  };

  const updateLine = (id: string, field: keyof EntryLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        // If debit is entered, clear credit and vice versa
        if (field === 'debit' && value > 0) updated.credit = 0;
        if (field === 'credit' && value > 0) updated.debit = 0;
        return updated;
      }
      return line;
    }));
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSave = () => {
    if (!isBalanced) {
      toast.error('القيد غير متزن. يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.');
      return;
    }
    toast.success('تم حفظ القيد بنجاح');
    navigate('/accounting/journal');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounting/journal')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إنشاء قيد يومية</h1>
            <p className="text-muted-foreground">إضافة حركة مالية جديدة إلى السجلات المحاسبية.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/accounting/journal')}>
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20" onClick={handleSave}>
            <Save className="w-4 h-4" />
            حفظ القيد
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>رقم القيد</Label>
              <Input value="JV-2024-006" disabled className="bg-muted font-bold" />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>المرجع (اختياري)</Label>
              <Input placeholder="رقم الفاتورة أو السند..." />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>الوصف العام</Label>
              <Input placeholder="أدخل وصفاً موجزاً للقيد..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">تفاصيل القيد</CardTitle>
            <Button variant="outline" size="sm" className="gap-2" onClick={addLine}>
              <Plus className="w-4 h-4" />
              إضافة سطر
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px]">الحساب</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="w-[150px] text-center">مدين</TableHead>
                <TableHead className="w-[150px] text-center">دائن</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Select onValueChange={(val) => updateLine(line.id, 'accountId', val)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="اختر الحساب..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="111">111 - الصندوق</SelectItem>
                        <SelectItem value="112">112 - البنك</SelectItem>
                        <SelectItem value="41">41 - مبيعات السلع</SelectItem>
                        <SelectItem value="51">51 - الرواتب والأجور</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="وصف السطر..." 
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="text-center font-bold text-blue-600" 
                      placeholder="0.00"
                      value={line.debit || ''}
                      onChange={(e) => updateLine(line.id, 'debit', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="text-center font-bold text-red-600" 
                      placeholder="0.00"
                      value={line.credit || ''}
                      onChange={(e) => updateLine(line.id, 'credit', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-muted/10 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">إجمالي المدين</p>
                <p className="text-xl font-black text-blue-600">{totalDebit.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">إجمالي الدائن</p>
                <p className="text-xl font-black text-red-600">{totalCredit.toLocaleString()} ر.س</p>
              </div>
              <div className="h-10 w-[1px] bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">الفرق</p>
                <p className={cn("text-xl font-black", difference === 0 ? "text-green-500" : "text-orange-500")}>
                  {difference.toLocaleString()} ر.س
                </p>
              </div>
            </div>
            
            {!isBalanced && totalDebit > 0 && (
              <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20 animate-pulse">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-bold">القيد غير متزن حالياً</span>
              </div>
            )}
            
            {isBalanced && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">القيد متزن وجاهز للحفظ</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
