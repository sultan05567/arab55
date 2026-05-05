import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ArrowRight,
  Printer,
  FileText,
  User,
  Calendar as CalendarIcon,
  Calculator,
  Percent,
  Tag,
  Loader2
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
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Customer, Product, InvoiceItem } from '@/types';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { profile } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', productId: '', name: '', quantity: 1, price: 0, tax: 15, total: 0 },
  ]);

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchInitialData = async () => {
      try {
        const customersSnap = await getDocs(query(collection(db, 'customers'), where('companyId', '==', profile.companyId), limit(100)));
        setCustomers(customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

        const productsSnap = await getDocs(query(collection(db, 'products'), where('companyId', '==', profile.companyId), limit(100)));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [profile?.companyId]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), productId: '', name: '', quantity: 1, price: 0, tax: 15, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.name = product.name;
            updated.price = product.price;
            updated.tax = product.taxRate;
          }
        }

        const subtotal = updated.quantity * updated.price;
        const taxAmount = subtotal * (updated.tax / 100);
        updated.total = subtotal + taxAmount;
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.quantity * item.price * (item.tax / 100)), 0);
  const total = subtotal + totalTax;

  const handleSave = async () => {
    if (!profile?.companyId) return;
    if (!selectedCustomerId) {
      toast.error('يرجى اختيار عميل');
      return;
    }

    setIsSaving(true);
    const path = `companies/${profile.companyId}/invoices`;
    const customer = customers.find(c => c.id === selectedCustomerId);

    try {
      await addDoc(collection(db, path), {
        number: `${Date.now().toString().slice(-6)}`,
        customerId: selectedCustomerId,
        customerName: customer?.name || 'عميل غير معروف',
        date: invoiceDate,
        dueDate: dueDate,
        subtotal,
        taxAmount: totalTax,
        total,
        status: 'issued',
        companyId: profile.companyId,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        items: items.map(({ id, ...rest }) => rest)
      });

      toast.success('تم إنشاء الفاتورة بنجاح');
      navigate('/sales');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 border-slate-200" onClick={() => navigate('/sales')}>
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">إنشاء فاتورة ضريبية</h1>
            <p className="text-slate-500 font-medium">خطوة بخطوة نحو إصدار فاتورة احترافية متوافقة مع المتطلبات.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl h-12 font-bold px-6" onClick={() => navigate('/sales')}>إلغاء</Button>
          <Button size="lg" className="rounded-2xl h-12 font-black px-10 shadow-xl shadow-primary/20 gap-3" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ الفاتورة
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-black text-slate-700">اختيار العميل</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700">
                      <SelectValue placeholder="ابحث عن عميل..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 p-2">
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 font-bold">{c.name}</SelectItem>
                      ))}
                      <SelectItem value="new" className="text-primary font-black">+ إضافة عميل جديد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black text-slate-700">الرقم الضريبي</Label>
                  <Input 
                    placeholder="سيظهر هنا تلقائياً" 
                    disabled 
                    className="h-14 rounded-2xl border-none bg-slate-50 px-6 font-bold text-slate-500" 
                    value={selectedCustomer?.taxNumber || ''} 
                  />
                </div>
                {selectedCustomer && (
                  <div className="md:col-span-2 p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 animate-in zoom-in-95 duration-500">
                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">عنوان الشحن والفوترة</p>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed">{selectedCustomer.address || 'لا يوجد عنوان مسجل لهذا العميل'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <Tag className="w-5 h-5" />
                </div>
                بنود الفاتورة
              </CardTitle>
              <Button variant="ghost" className="rounded-xl gap-2 font-black text-primary hover:bg-primary/5" onClick={addItem}>
                <Plus className="w-5 h-5" />
                إضافة بند
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="border-slate-100 hover:bg-transparent h-14">
                    <TableHead className="w-[350px] px-8 font-black text-slate-700">المنتج / الخدمة</TableHead>
                    <TableHead className="w-[120px] text-center font-black text-slate-700">الكمية</TableHead>
                    <TableHead className="w-[150px] text-center font-black text-slate-700">السعر</TableHead>
                    <TableHead className="w-[180px] text-right font-black text-slate-700 px-8">الإجمالي</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/20 transition-colors">
                      <TableCell className="px-8 py-6">
                        <Select value={item.productId} onValueChange={(val) => updateItem(item.id, 'productId', val)}>
                          <SelectTrigger className="h-12 border-slate-100 rounded-xl px-4 font-bold">
                            <SelectValue placeholder="اختر من المخزون..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 p-2">
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id} className="rounded-xl py-2.5 font-bold">{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-12 border-slate-100 rounded-xl text-center font-black text-primary" 
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input 
                            type="number" 
                            className="h-12 border-slate-100 rounded-xl text-center font-bold pl-10" 
                            value={item.price || ''}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ر.س</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-slate-900">{item.total.toLocaleString()} ر.س</span>
                          <span className="text-[10px] font-bold text-emerald-500">شامل الضريبة 15%</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 font-black">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <FileText className="w-5 h-5" />
                </div>
                تفاصيل الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-black text-slate-700">تاريخ الإصدار</Label>
                <div className="relative">
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input type="date" value={invoiceDate} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pr-12 font-bold" onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-black text-slate-700">تاريخ الاستحقاق</Label>
                <div className="relative">
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input type="date" value={dueDate} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pr-12 font-bold" onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-16 -mb-16" />
            
            <CardContent className="p-10 space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>المجموع الفرعي</span>
                  <span className="text-white">{subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>ضريبة القيمة المضافة</span>
                  <span className="text-white">{totalTax.toLocaleString()} ر.س</span>
                </div>
              </div>
              
              <div className="h-[1px] bg-white/10" />
              
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي المبلغ المطلوب</span>
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black">{total.toLocaleString()}</span>
                  <span className="text-xl font-bold text-primary mb-1">ر.س</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 gap-3" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  تأكيد الفاتورة
                </Button>
                <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold gap-2">
                  <Printer className="w-5 h-5" />
                  حفظ بصيغة PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
