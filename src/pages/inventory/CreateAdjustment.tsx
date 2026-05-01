import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Save, 
  X, 
  Loader2,
  Package,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export default function CreateAdjustment() {
  const navigate = useNavigate();
  const { profile } = useFirebase();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    adjustmentType: 'add' as 'add' | 'subtract',
    quantity: 0,
    reason: 'correction' as 'damage' | 'correction' | 'expired' | 'return' | 'other',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('companyId', '==', profile.companyId));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(docs);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [profile?.companyId]);

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.companyId || !selectedProduct) return;

    if (formData.quantity <= 0) {
      toast.error('يجب أن تكون الكمية أكبر من صفر');
      return;
    }

    const adjQuantity = formData.adjustmentType === 'add' ? formData.quantity : -formData.quantity;
    const newStock = (selectedProduct.stock || 0) + adjQuantity;

    if (newStock < 0) {
      toast.error('لا يمكن أن يكون المخزون الناتج أقل من صفر');
      return;
    }

    setSaving(true);
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', selectedProduct.id);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error("المنتج غير موجود");
        }

        const currentStock = productDoc.data().stock || 0;
        const updatedStock = currentStock + adjQuantity;

        if (updatedStock < 0) {
          throw new Error("المخزون غير كافٍ لإجراء هذه التسوية");
        }

        // 1. Update Product Stock
        transaction.update(productRef, { stock: updatedStock });

        // 2. Record Adjustment
        const adjustmentRef = doc(collection(db, `companies/${profile.companyId}/inventoryAdjustments`));
        transaction.set(adjustmentRef, {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          adjustmentQuantity: adjQuantity,
          newStock: updatedStock,
          reason: formData.reason,
          referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
          adjustedByUserID: profile.uid,
          note: formData.note,
          date: formData.date,
          companyId: profile.companyId,
          createdBy: profile.uid,
          createdAt: serverTimestamp(),
        });
      });

      toast.success('تمت عملية تسوية المخزون بنجاح');
      navigate('/inventory/adjustments');
    } catch (error: any) {
      console.error('Error saving adjustment:', error);
      toast.error(error.message || 'فشل في حفظ عملية التسوية');
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/adjustments')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">تسوية مخزون جديدة</h1>
            <p className="text-muted-foreground">تعديل كمية منتج في المستودع ببيان السبب.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/inventory/adjustments')}>
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button 
            className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20" 
            onClick={handleSave}
            disabled={saving || !formData.productId}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التسوية
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>بيانات المنتج والكمية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>المنتج المستهدف</Label>
                  <Select 
                    value={formData.productId} 
                    onValueChange={(val) => setFormData({...formData, productId: val})}
                  >
                    <SelectTrigger className="bg-background h-12">
                      <SelectValue placeholder="اختر المنتج..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تاريخ التسوية</Label>
                  <Input 
                    type="date" 
                    className="h-12"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>نوع التعديل</Label>
                  <Select 
                    value={formData.adjustmentType} 
                    onValueChange={(val: any) => setFormData({...formData, adjustmentType: val})}
                  >
                    <SelectTrigger className="bg-background h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">إضافة (زيادة المخزون)</SelectItem>
                      <SelectItem value="subtract">خصم (نقص المخزون)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الكمية المتأثرة</Label>
                  <Input 
                    type="number" 
                    className="h-12 font-bold text-lg"
                    placeholder="0"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>سبب التسوية</Label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(val: any) => setFormData({...formData, reason: val})}
                >
                  <SelectTrigger className="bg-background h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correction">تصحيح جرد</SelectItem>
                    <SelectItem value="damage">تلف / كسر</SelectItem>
                    <SelectItem value="expired">انتهاء صلاحية</SelectItem>
                    <SelectItem value="return">مرتجع</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات إضافية</Label>
                <Textarea 
                  placeholder="أدخل تفاصيل إضافية حول سبب التسوية..."
                  className="min-h-[100px] bg-background"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                ملخص العملية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-primary/10">
                    <span className="text-muted-foreground text-sm">المخزون الحالي:</span>
                    <span className="font-bold">{selectedProduct.stock || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-primary/10">
                    <span className="text-muted-foreground text-sm">تعديل بـ:</span>
                    <span className={cn(
                      "font-bold",
                      formData.adjustmentType === 'add' ? "text-green-500" : "text-red-500"
                    )}>
                      {formData.adjustmentType === 'add' ? '+' : '-'}{formData.quantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground text-sm font-bold">المخزون المتوقع:</span>
                    <span className="text-xl font-black text-primary">
                      {(selectedProduct.stock || 0) + (formData.adjustmentType === 'add' ? formData.quantity : -formData.quantity)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  اختر منتجاً لعرض ملخص التغيير
                </div>
              )}
            </CardContent>
          </Card>

          {selectedProduct && (selectedProduct.stock || 0) + (formData.adjustmentType === 'add' ? formData.quantity : -formData.quantity) < 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium">خطأ: الكمية الناتجة لا يمكن أن تكون سالبة. يرجى مراجعة الكمية المدخلة.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
