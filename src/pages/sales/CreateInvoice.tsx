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
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
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
        const customersSnap = await getDocs(query(collection(db, 'customers'), where('companyId', '==', profile.companyId)));
        setCustomers(customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

        const productsSnap = await getDocs(query(collection(db, 'products'), where('companyId', '==', profile.companyId)));
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
        number: `INV-${Date.now().toString().slice(-6)}`,
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sales')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إنشاء فاتورة ضريبية</h1>
            <p className="text-muted-foreground">إصدار فاتورة مبيعات جديدة متوافقة مع متطلبات هيئة الزكاة والضريبة.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/sales')} disabled={isSaving}>
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ الفاتورة
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>العميل</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عميلاً..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                      <SelectItem value="new">+ إضافة عميل جديد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الرقم الضريبي للعميل</Label>
                  <Input placeholder="300000000000003" disabled className="bg-muted" value={selectedCustomer?.taxNumber || ''} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>العنوان</Label>
                  <Input placeholder="الرياض، حي العليا، طريق الملك فهد" disabled className="bg-muted" value={selectedCustomer?.address || ''} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  المنتجات والخدمات
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={addItem}>
                  <Plus className="w-4 h-4" />
                  إضافة بند
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[300px]">المنتج / الخدمة</TableHead>
                    <TableHead className="w-[100px] text-center">الكمية</TableHead>
                    <TableHead className="w-[150px] text-center">السعر</TableHead>
                    <TableHead className="w-[100px] text-center">الضريبة %</TableHead>
                    <TableHead className="w-[150px] text-right">الإجمالي</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select value={item.productId} onValueChange={(val) => updateItem(item.id, 'productId', val)}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="اختر منتجاً..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="text-center" 
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="text-center" 
                          value={item.price || ''}
                          placeholder="0.00"
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select defaultValue="15" onValueChange={(val) => updateItem(item.id, 'tax', parseInt(val))}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="0">0%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {item.total.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                تفاصيل الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>رقم الفاتورة</Label>
                <Input value="INV-2024-005" disabled className="bg-muted font-bold" />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الفاتورة</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>شروط الدفع</Label>
                <Select defaultValue="14">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">عند الاستلام</SelectItem>
                    <SelectItem value="7">خلال 7 أيام</SelectItem>
                    <SelectItem value="14">خلال 14 يوماً</SelectItem>
                    <SelectItem value="30">خلال 30 يوماً</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-primary text-primary-foreground">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>إجمالي الضريبة (15%)</span>
                <span>{totalTax.toLocaleString()} ر.س</span>
              </div>
              <div className="h-[1px] bg-white/20 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">الإجمالي النهائي</span>
                <span className="text-2xl font-black">{total.toLocaleString()} ر.س</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button className="w-full h-12 gap-2 text-lg font-bold shadow-xl shadow-primary/20" onClick={handleSave}>
              <Save className="w-5 h-5" />
              حفظ وإرسال
            </Button>
            <Button variant="outline" className="w-full h-12 gap-2 font-bold">
              <Printer className="w-5 h-5" />
              حفظ وطباعة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
