import { 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Globe, 
  LayoutDashboard,
  Menu,
  X,
  Building2,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/30" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                Q
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">QAYD</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">المميزات</a>
              <a href="#solutions" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">الحلول</a>
              <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">الأسعار</a>
              <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">اتصل بنا</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-slate-700">تسجيل الدخول</Button>
            </Link>
            <Link to="/register">
              <Button className="font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/20">ابدأ الآن مجاناً</Button>
            </Link>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8">
              <Zap className="w-4 h-4" />
              <span>النظام المحاسبي الأذكى في الشرق الأوسط</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8">
              أدر أعمالك <span className="text-primary">باحترافية</span> <br />
              من أي مكان وفي أي وقت
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
              QAYD هو النظام المحاسبي والإداري السحابي المتكامل المصمم خصيصاً لنمو الشركات في السوق السعودي والخليجي. سهولة، سرعة، وأمان لا يضاهى.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/30">
                ابدأ تجربتك المجانية
              </Button>
              <Button variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-2">
                مشاهدة عرض توضيحي
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-8 opacity-60 grayscale">
              <Building2 className="w-12 h-12" />
              <Globe className="w-12 h-12" />
              <ShieldCheck className="w-12 h-12" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10" />
            <img 
              src="https://picsum.photos/seed/dashboard/1200/800" 
              alt="Dashboard Preview" 
              className="rounded-3xl shadow-2xl border border-slate-200 rotate-2 hover:rotate-0 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">تم تحصيل الفاتورة</p>
                  <p className="text-xs text-slate-500">منذ دقيقة واحدة</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">كل ما تحتاجه لإدارة شركتك في مكان واحد</h2>
            <p className="text-slate-600 text-lg">نظام متكامل يغطي كافة جوانب عملك من المحاسبة إلى الموارد البشرية.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'المحاسبة العامة', desc: 'دليل حسابات شجري، قيود يومية، وتقارير مالية دقيقة.', icon: BarChart3 },
              { title: 'المبيعات والمشتريات', desc: 'إدارة الفواتير، عروض الأسعار، والموردين بكل سهولة.', icon: ShoppingCart },
              { title: 'إدارة المخزون', desc: 'تتبع المنتجات، المستودعات، وحركات المخزون لحظة بلحظة.', icon: Package },
              { title: 'الموارد البشرية', desc: 'إدارة الموظفين، الرواتب، والحضور والانصراف.', icon: Users },
              { title: 'إدارة المشاريع', desc: 'تتبع المهام، التكاليف، ونسب الإنجاز في مشاريعك.', icon: LayoutDashboard },
              { title: 'الفوترة الإلكترونية', desc: 'متوافق تماماً مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).', icon: ShieldCheck },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span className="text-2xl font-black tracking-tighter">QAYD</span>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              نحن هنا لنغير مفهوم الإدارة المحاسبية في العالم العربي. نظام ذكي، واجهة عصرية، ودعم فني متواصل.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">الرئيسية</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">المميزات</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">الأسعار</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">المدونة</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-4 text-slate-400">
              <li>info@arab1000.online</li>
              <li>+966 500 000 000</li>
              <li>الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          جميع الحقوق محفوظة © 2024 QAYD | النظام المحاسبي والإداري الذكي
        </div>
      </footer>
    </div>
  );
}
