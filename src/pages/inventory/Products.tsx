import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Package, 
  Tag, 
  Layers, 
  AlertTriangle,
  Edit,
  Trash2,
  Barcode as BarcodeIcon,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Printer
} from 'lucide-react';
import Barcode from 'react-barcode';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { cn } from '@/lib/utils';

export default function Products() {
  const { profile } = useFirebase();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  useEffect(() => {
    if (!profile?.companyId) return;

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

    const path = 'products';
    const q = query(
      collection(db, path),
      where('companyId', '==', profile.companyId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [profile?.companyId]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'عام')))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (product.category || 'عام') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10);
  const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);

  const handlePrintBarcode = (product: Product) => {
    setSelectedProduct(product);
    setIsBarcodeOpen(true);
  };

  const executePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">المنتجات والمخزون</h1>
          <p className="text-slate-500 font-medium">نظرة شاملة على منتجاتك، وتتبع دقيق للكميات والباركود.</p>
        </div>
        <Button size="lg" className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-12 font-bold px-8">
          <Plus className="w-5 h-5" />
          إضافة منتج جديد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'إجمالي المنتجات', value: products.length, icon: Package, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'قيمة المخزون', value: products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0).toLocaleString() + ' ر.س', icon: Tag, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'منخفض المخزون', value: lowStockProducts.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50/30' },
          { label: 'نفذ من المخزون', value: outOfStockProducts.length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/30' },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm card-hover", stat.bg)}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
        <CardHeader className="border-b border-slate-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-4 flex-1">
              <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
                <TabsList className="bg-slate-50 border-none p-1 rounded-xl h-11 inline-flex w-auto max-w-full overflow-x-auto no-scrollbar">
                  {categories.map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
                    >
                      {cat === 'all' ? 'الكل' : cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="بحث بالاسم، SKU، أو الباركود..." 
                  className="pr-11 bg-slate-50 border-none rounded-2xl h-12 font-bold text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-center">
              <Button variant="outline" className="rounded-xl h-11 border-slate-100 font-bold gap-2">
                <Filter className="w-4 h-4" />
                تصفية
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="px-8 h-14 font-black text-slate-800">المنتج</TableHead>
                <TableHead className="font-black text-slate-800">SKU</TableHead>
                <TableHead className="font-black text-slate-800 text-center">التصنيف</TableHead>
                <TableHead className="text-right font-black text-slate-800">السعر</TableHead>
                <TableHead className="text-center font-black text-slate-800">الكمية</TableHead>
                <TableHead className="text-center font-black text-slate-800">الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <span className="font-black text-slate-900 line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] font-bold text-slate-400">
                    <span className="bg-slate-50 px-2 py-1 rounded-md">{product.sku || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-xl px-3 py-1 bg-white border-slate-100 font-bold text-slate-600">
                      {product.category || 'عام'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900">{product.price.toLocaleString()} ر.س</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-lg font-black",
                        (product.stock || 0) <= 0 ? "text-rose-500" : 
                        (product.stock || 0) < 10 ? "text-amber-500" : 
                        "text-slate-900"
                      )}>
                        {product.stock || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {(product.stock || 0) > 10 ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-3 font-bold text-[10px]">متوفر</Badge>
                    ) : (product.stock || 0) > 0 ? (
                      <Badge className="bg-amber-50 text-amber-600 border-none rounded-full px-3 font-bold text-[10px]">منخفض</Badge>
                    ) : (
                      <Badge className="bg-rose-50 text-rose-600 border-none rounded-full px-3 font-bold text-[10px]">نافذ</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl opacity-0 group-hover:opacity-100 transition-opacity")}>
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border-slate-100 shadow-xl shadow-slate-200/50">
                        <DropdownMenuItem 
                          className="gap-3 rounded-xl py-2.5 font-bold"
                          onClick={() => handlePrintBarcode(product)}
                        >
                          <BarcodeIcon className="w-4 h-4 text-slate-400" />
                          طباعة الباركود
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold">
                          <Edit className="w-4 h-4 text-slate-400" />
                          تعديل المنتج
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 rounded-xl py-2.5 font-bold text-rose-600 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                          حذف المنتج
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

      {/* Barcode Print Modal */}
      <Dialog open={isBarcodeOpen} onOpenChange={setIsBarcodeOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <DialogTitle className="text-2xl font-black tracking-tighter">معاينة الباركود</DialogTitle>
          </div>
          
          <div className="p-8">
            <div id="barcode-print-area" className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              {selectedProduct && (
                <div className="text-center space-y-6">
                  <div className="font-black text-xl text-slate-900 tracking-tight">{selectedProduct.name}</div>
                  <div className="flex justify-center bg-white p-6 rounded-2xl shadow-sm">
                    <Barcode 
                      value={selectedProduct.sku || selectedProduct.id || '000000'} 
                      width={2}
                      height={80}
                      fontSize={16}
                      background="#ffffff"
                      lineColor="#000000"
                    />
                  </div>
                  <div className="text-3xl font-black text-primary">{selectedProduct.price.toLocaleString()} ر.س</div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{company?.name || 'QAYD CLOUD'}</div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 flex sm:justify-between items-center gap-4">
            <Button variant="ghost" onClick={() => setIsBarcodeOpen(false)} className="rounded-xl px-8 font-bold">إغلاق</Button>
            <Button onClick={executePrint} className="rounded-2xl h-14 px-10 gap-3 font-black shadow-xl shadow-primary/20">
              <Printer className="w-5 h-5" />
              تأكيد الطباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #barcode-print-area, #barcode-print-area * { visibility: visible; }
          #barcode-print-area { 
            position: fixed; 
            left: 50%; 
            top: 40%; 
            transform: translate(-50%, -40%); 
            width: auto;
            border: none;
            padding: 20px;
            background: white !important;
          }
        }
      `}} />
    </div>
  );
}
