import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight, Briefcase, Building2, Store, WashingMachine, Coffee, ShoppingBag, Users, Layout, Package, Monitor, FileText, ClipboardList } from 'lucide-react';
import { BUSINESS_SECTORS, ALL_MODULES } from '@/constants/sectors';
import { SectorKey } from '@/types';
import { cn } from '@/lib/utils';
import { doc, updateDoc, writeBatch, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useFirebase } from '@/components/FirebaseProvider';
import { useModules } from '@/components/ModuleProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DynamicIcon } from '@/components/DynamicIcon';

const SECTOR_ICONS: Record<SectorKey, any> = {
  services: Briefcase,
  construction: Building2,
  grocery: Store,
  laundry: WashingMachine,
  cafe_restaurant: Coffee,
  retail: ShoppingBag,
  recruitment: Users,
  other: Layout
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<SectorKey | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const { profile } = useFirebase();
  const { modules } = useModules();
  const navigate = useNavigate();

  const handleSectorSelect = (sector: SectorKey) => {
    setSelectedSector(sector);
    const sectorDef = BUSINESS_SECTORS.find(s => s.key === sector);
    if (sectorDef) {
      // Find dynamic modules that match the default list for this sector
      const defaults = modules
        .filter(m => sectorDef.defaultModules.includes(m.key as any))
        .map(m => m.key);
      setSelectedModules(defaults);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleFinish = async () => {
    if (!profile?.companyId || !selectedSector) return;

    try {
      // Update company in Firebase
      const companyRef = doc(db, 'companies', profile.companyId);
      await updateDoc(companyRef, {
        sectorKey: selectedSector,
        onboardingCompleted: true
      });

      // Save enabled modules in Supabase
      const moduleInserts = selectedModules.map(key => ({
        company_id: profile.companyId,
        module_key: key,
        is_enabled: true
      }));

      const { error } = await supabase
        .from('company_modules')
        .insert(moduleInserts);

      if (error) throw error;

      toast.success('تمت تهيئة نظامك بنجاح!');
      navigate('/dashboard');
      window.location.reload(); 
    } catch (error) {
      console.error('Error in onboarding:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 mx-auto mb-6">Q</div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">أهلاً بك في قيد</h1>
          <p className="text-slate-500 font-medium mt-2">لنقم بتهيئة النظام بما يتناسب مع نشاطك التجاري</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn(
              "w-12 h-2 rounded-full transition-all",
              step >= i ? "bg-primary" : "bg-slate-200"
            )} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">ما هو نوع نشاطك التجاري؟</h2>
              <p className="text-slate-500">سيساعدنا هذا في تخصيص تجربتك</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BUSINESS_SECTORS.map((sector) => {
                const Icon = SECTOR_ICONS[sector.key];
                return (
                  <button
                    key={sector.key}
                    onClick={() => handleSectorSelect(sector.key)}
                    className={cn(
                      "flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all group",
                      selectedSector === sector.key 
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                        : "border-white bg-white hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                      selectedSector === sector.key ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white"
                    )}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className={cn(
                      "font-black text-sm",
                      selectedSector === sector.key ? "text-primary" : "text-slate-600"
                    )}>{sector.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-8">
              <Button 
                size="lg" 
                className="rounded-2xl px-12 h-14 font-black text-lg gap-2"
                disabled={!selectedSector}
                onClick={() => setStep(2)}
              >
                المتابعة <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">تخصيص المميزات</h2>
              <p className="text-slate-500">لقد اخترنا لك أفضل الإعدادات لقطاع {BUSINESS_SECTORS.find(s => s.key === selectedSector)?.name}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-4 no-scrollbar">
              {modules.map((module) => (
                <button
                  key={module.key}
                  onClick={() => toggleModule(module.key)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border-2 text-right transition-all",
                    selectedModules.includes(module.key)
                      ? "border-primary bg-primary/5"
                      : "border-white bg-white"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    selectedModules.includes(module.key) ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {selectedModules.includes(module.key) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <DynamicIcon name={module.icon} className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">{module.name_ar}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{module.name_en}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setStep(1)}>السابق</Button>
              <Button 
                size="lg" 
                className="rounded-2xl px-12 h-14 font-black text-lg gap-2"
                onClick={() => setStep(3)}
              >
                مراجعة الإعدادات <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
              <CardHeader className="bg-primary p-12 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
                  <Check className="w-10 h-10" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter">كل شيء جاهز!</CardTitle>
                <CardDescription className="text-white/70 font-bold text-lg">ستبدأ الآن باستخدام النسخة المخصصة لـ {BUSINESS_SECTORS.find(s => s.key === selectedSector)?.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedModules.slice(0, 8).map(mKey => {
                    const mod = modules.find(m => m.key === mKey);
                    return (
                      <div key={mKey} className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700">{mod?.name_ar || mKey}</span>
                      </div>
                    );
                  })}
                  {selectedModules.length > 8 && (
                    <div className="flex items-center justify-center p-3 text-slate-400 font-black text-sm">
                      +{selectedModules.length - 8} مميزات أخرى
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-12 bg-slate-50 flex justify-between gap-6">
                <Button variant="ghost" className="rounded-xl font-bold px-8 h-12" onClick={() => setStep(2)}>تعديل الاختيارات</Button>
                <Button 
                  size="lg" 
                  className="rounded-2xl flex-1 h-14 font-black shadow-xl shadow-primary/20 text-xl"
                  onClick={handleFinish}
                >
                  بدء استخدام قيد الآن
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
