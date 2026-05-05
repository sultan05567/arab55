import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  History, 
  AlertCircle,
  Loader2,
  ArrowRightLeft
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { InventoryAdjustment } from '@/types';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { cn } from '@/lib/utils';

const reasonLabels = {
  damage: 'تلف',
  correction: 'تصحيح جرد',
  expired: 'انتهاء صلاحية',
  return: 'مرتجع',
  other: 'أخرى',
};

export default function InventoryAdjustments() {
  const { profile } = useFirebase();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile?.companyId) return;

    const path = `companies/${profile.companyId}/inventoryAdjustments`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryAdjustment));
      setAdjustments(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [profile?.companyId]);

  const filteredAdjustments = adjustments.filter(adj => 
    adj.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تسويات المخزون</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع تسويات كميات المنتجات.</p>
        </div>
        <Link to="/inventory/adjustments/new">
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            إجراء تسوية جديدة
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي التسويات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adjustments.length} عملية</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">تسويات هذا الشهر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {adjustments.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length} عملية
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">أكثر الأسباب شيوعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {adjustments.length > 0 ? reasonLabels[adjustments[0].reason] : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث بالمنتج أو السبب..." 
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>المرجع</TableHead>
                <TableHead>المنتج</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead className="text-center">كمية التسوية</TableHead>
                <TableHead className="text-center">الرصيد الجديد</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length > 0 ? filteredAdjustments.map((adj) => (
                <TableRow key={adj.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{adj.referenceNumber || '-'}</TableCell>
                  <TableCell className="font-bold">{adj.productName}</TableCell>
                  <TableCell>{adj.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {reasonLabels[adj.reason] || adj.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "font-bold",
                      adj.adjustmentQuantity > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {adj.adjustmentQuantity > 0 ? '+' : ''}{adj.adjustmentQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold">{adj.newStock}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {adj.note || '-'}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    لا توجد تسويات مخزون حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
