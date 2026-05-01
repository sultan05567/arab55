import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50"
      >
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">غير مصرح بالدخول</h1>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">
            عذراً، لاتمتلك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التواصل مع مسؤول النظام.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="w-full rounded-2xl h-14 font-black text-lg gap-2 shadow-xl shadow-primary/20"
          >
            العودة للرئيسية <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
