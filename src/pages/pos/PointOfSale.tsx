import { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  User, 
  ChevronRight,
  Loader2,
  PackageCheck,
  Zap,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { Product, InvoiceItem, Customer } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { seedGroceryProducts } from '@/services/storeSeeder';

interface CartItem extends Product {
  quantity: number;
}

export default function PointOfSale() {
  const { profile, isAuthReady } = useFirebase();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!profile?.companyId) {
      setError('لم يتم العثور على بيانات الشركة. يرجى التأكد من اكتمال إعداد حسابك.');
      setLoading(false);
      return;
    }

    // Fetch company data
    const fetchCompany = async () => {
      try {
        const companyDoc = await getDoc(doc(db, 'companies', profile.companyId));
        if (companyDoc.exists()) {
          setCompany(companyDoc.data());
        }
      } catch (err) {
        console.warn('Failed to fetch company:', err);
      }
    };
    fetchCompany();

    // Seed grocery products if none exist
    seedGroceryProducts(profile.companyId).catch(err => {
      console.warn('Seeding failed:', err);
    });

    const productsQuery = query(
      collection(db, 'products'),
      where('companyId', '==', profile.companyId)
    );

    const customersQuery = query(
      collection(db, 'customers'),
      where('companyId', '==', profile.companyId)
    );

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
      setError('حدث خطأ أثناء تحميل المنتجات. تأكد من صلاحيات الوصول.');
      toast.error('خطأ في تحميل المنتجات');
    });

    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'customers');
    });

    return () => {
      unsubProducts();
      unsubCustomers();
    };
  }, [profile?.companyId, isAuthReady]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateTax = () => cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.taxRate / 100)), 0);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handlePrint = () => {
    window.print();
  };

  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const customer = customers.find(c => c.id === selectedCustomerId);
      
      const invoiceData = {
        number: invoiceNumber,
        customerId: selectedCustomerId,
        customerName: customer?.name || 'عميل نقدي',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
        status: 'paid',
        paymentMethod,
        companyId: profile?.companyId,
        createdBy: profile?.uid,
        createdAt: serverTimestamp(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          tax: item.price * (item.taxRate / 100),
          total: item.price * item.quantity * (1 + item.taxRate / 100)
        }))
      };

      // Add Invoice
      const invoiceRef = doc(collection(db, `companies/${profile?.companyId}/invoices`));
      batch.set(invoiceRef, invoiceData);

      // Update Stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: (item.stock || 0) - item.quantity
        });
      }

      await batch.commit();
      
      setLastOrder({
        ...invoiceData,
        id: invoiceRef.id,
        customerName: customer?.name || 'عميل نقدي'
      });
      setShowReceipt(true);
      
      toast.success('تمت عملية البيع بنجاح');
      setCart([]);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء إتمام العملية');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">جاري تهيئة نظام الكاشير...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-muted/10">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">عذراً، تعذر تشغيل الكاشير</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden border-l border-border bg-background">
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="البحث عن منتج (الاسم أو SKU)..." 
              className="pr-10 h-11 rounded-xl bg-muted/50 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 flex-1 overflow-hidden bg-muted/20 p-1.5 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 px-3">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold text-foreground">التصنيفات</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "rounded-xl whitespace-nowrap px-5 h-8 text-xs font-medium transition-all",
                    selectedCategory === cat ? "shadow-sm" : "hover:bg-background/80"
                  )}
                  onClick={() => setSelectedCategory(cat as string)}
                >
                  {cat === 'all' ? 'جميع المنتجات' : cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200 border-none shadow-sm overflow-hidden flex flex-col"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Zap className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80 border-none">
                      {product.price.toLocaleString()} ر.س
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3 flex-1 flex flex-col justify-between pt-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm line-clamp-2 leading-tight h-10">{product.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">{product.sku}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      product.stock > 10 ? "bg-green-500/10 text-green-500" : 
                      product.stock > 0 ? "bg-orange-500/10 text-orange-500" : 
                      "bg-red-500/10 text-red-500"
                    )}>
                      {product.stock} حبة
                    </span>
                    <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col bg-card shadow-xl z-10 border-r border-border shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h3 className="font-bold">سلة المبيعات</h3>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} منتجات
          </Badge>
        </div>

        {/* Customer Select */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">العميل</span>
          </div>
          <select 
            className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="walk-in">عميل نقدي</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-sm font-medium">السلة فارغة</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 group animate-in slide-in-from-left-2 transition-all">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Zap className="w-full h-full p-3 opacity-20" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <h5 className="text-xs font-bold line-clamp-1">{item.name}</h5>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="w-6 h-6 rounded-md"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="w-6 h-6 rounded-md"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {(item.price * item.quantity).toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-6 bg-muted/30 border-t border-border space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{calculateSubtotal().toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span>{calculateTax().toLocaleString()} ر.س</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-bold text-lg">
              <span>الإجمالي</span>
              <span className="text-primary">{calculateTotal().toLocaleString()} ر.س</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="h-14 font-bold flex flex-col gap-0.5 rounded-2xl" 
              onClick={() => handleCheckout('cash')}
              disabled={isProcessing || cart.length === 0}
            >
              <Banknote className="w-5 h-5 mb-1" />
              <span>دفع كاش</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-14 font-bold flex flex-col gap-0.5 border-2 border-primary/20 hover:border-primary rounded-2xl"
              onClick={() => handleCheckout('card')}
              disabled={isProcessing || cart.length === 0}
            >
              <CreditCard className="w-5 h-5 mb-1 text-primary" />
              <span>دفع بطاقة</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
          >
            إلغاء السلة
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white text-black w-full max-w-sm rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div id="receipt-content" className="p-6 overflow-y-auto print:p-0 flex-1">
              <div className="text-center space-y-2 mb-6 border-b border-dashed border-gray-300 pb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest">{company?.name || 'متجرنا'}</h2>
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <p>الرقم الضريبي: {company?.taxNumber || 'غير متوفر'}</p>
                  <p>رقم الفاتورة: {lastOrder.number}</p>
                  <p>التاريخ: {new Date().toLocaleString('ar-SA')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold border-b border-gray-100 pb-2">
                  <span>المنتج</span>
                  <div className="flex gap-4">
                    <span>الكمية</span>
                    <span>السعر</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {lastOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="flex-1 pr-2">{item.name}</span>
                      <div className="flex gap-4 min-w-[80px] justify-end">
                        <span>{item.quantity}</span>
                        <span className="font-bold">{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>المجموع</span>
                    <span>{lastOrder.subtotal.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>الضريبة (15%)</span>
                    <span>{lastOrder.taxAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                    <span>الإجمالي النهائي</span>
                    <span>{lastOrder.total.toLocaleString()} ر.س</span>
                  </div>
                </div>

                <div className="text-center pt-6 space-y-2">
                  <div className="bg-gray-100 p-2 rounded text-[10px]">
                    طريقة الدفع: {lastOrder.paymentMethod === 'cash' ? 'كاش' : 'بطاقة شبكة'}
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-24 h-24 bg-muted animate-pulse rounded"></div>
                    <span className="text-[8px]">شكراً لزيارتكم</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 print:hidden">
              <Button 
                className="flex-1 gap-2" 
                onClick={handlePrint}
              >
                <Zap className="w-4 h-4" />
                طباعة الفاتورة
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowReceipt(false)}
              >
                إغلاق
              </Button>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden; }
              #receipt-content, #receipt-content * { visibility: visible; }
              #receipt-content { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
