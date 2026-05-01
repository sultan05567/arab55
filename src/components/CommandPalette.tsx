import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Package, 
  Users, 
  LayoutDashboard, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const { profile } = useFirebase();
  const navigate = useNavigate();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch products when searching
  useEffect(() => {
    if (!open || !search || !profile?.companyId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('companyId', '==', profile.companyId),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        setProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search, open, profile?.companyId]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      label="Global Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-300" dir="rtl">
        <div className="flex items-center px-6 border-b border-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <Command.Input 
            placeholder="ابحث عن منتج، صفحة، أو إجراء..." 
            value={search}
            onValueChange={setSearch}
            className="w-full h-16 px-4 bg-transparent border-none outline-none text-lg font-bold text-slate-800 placeholder:text-slate-300"
          />
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400">
            <span>ESC</span>
          </div>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          <Command.Empty className="py-12 text-center">
            <Search className="w-12 h-12 text-slate-100 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">لم يتم العثور على نتائج لـ "{search}"</p>
          </Command.Empty>

          {!search && (
            <>
              <Command.Group heading="التنقل السريع" className="px-2 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <CommandItem icon={LayoutDashboard} label="لوحة التحكم" onSelect={() => runCommand(() => navigate('/'))} />
                <CommandItem icon={FileText} label="فواتير المبيعات" onSelect={() => runCommand(() => navigate('/sales'))} />
                <CommandItem icon={Package} label="المنتجات والمخزون" onSelect={() => runCommand(() => navigate('/inventory/products'))} />
                <CommandItem icon={Users} label="جهات الاتصال والعملاء" onSelect={() => runCommand(() => navigate('/crm/contacts'))} />
              </Command.Group>

              <Command.Separator className="h-[1px] bg-slate-50 my-2" />

              <Command.Group heading="إجراءات سريعة" className="px-2 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <CommandItem icon={PlusCircle} label="إنشاء فاتورة جديدة" onSelect={() => runCommand(() => navigate('/sales/new'))} color="text-primary" />
                <CommandItem icon={TrendingUp} label="إضافة منتج للمخزون" onSelect={() => runCommand(() => navigate('/inventory/products'))} color="text-emerald-500" />
              </Command.Group>
            </>
          )}

          {search && products.length > 0 && (
            <Command.Group heading="المنتجات" className="px-2 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {products.map(product => (
                <CommandItem 
                  key={product.id} 
                  icon={Package} 
                  label={product.name} 
                  subLabel={`${product.price.toLocaleString()} ر.س - المخزون: ${product.stock}`}
                  onSelect={() => runCommand(() => navigate('/inventory/products'))} 
                />
              ))}
            </Command.Group>
          )}

          {search && (
            <Command.Group heading="بحث في الأقسام" className="px-2 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
               <CommandItem icon={ArrowRight} label={`انتقل إلى فواتير المبيعات لـ "${search}"`} onSelect={() => runCommand(() => navigate('/sales'))} />
               <CommandItem icon={ArrowRight} label={`انتقل إلى جهات الاتصال لـ "${search}"`} onSelect={() => runCommand(() => navigate('/crm/contacts'))} />
            </Command.Group>
          )}
        </Command.List>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="p-1 px-1.5 bg-white border border-slate-200 rounded">↑↓</span> للتنقل</span>
            <span className="flex items-center gap-1"><span className="p-1 px-1.5 bg-white border border-slate-200 rounded">ENTER</span> للاختيار</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            <span>QAYD CLOUD</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

function CommandItem({ 
  icon: Icon, 
  label, 
  subLabel, 
  onSelect, 
  color = "text-slate-500" 
}: { 
  icon: any, 
  label: string, 
  subLabel?: string, 
  onSelect: () => void,
  color?: string
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary group transition-all"
    >
      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-aria-selected:bg-white transition-colors", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-800 group-aria-selected:text-primary transition-colors">{label}</span>
        {subLabel && <span className="text-[10px] font-bold text-slate-400">{subLabel}</span>}
      </div>
      <ArrowRight className="w-4 h-4 mr-auto opacity-0 group-aria-selected:opacity-100 -translate-x-2 group-aria-selected:translate-x-0 transition-all text-primary" />
    </Command.Item>
  );
}
