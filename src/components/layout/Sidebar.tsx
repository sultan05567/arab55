import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFirebase } from '../FirebaseProvider';
import { useModules } from '../ModuleProvider';
import { DynamicIcon } from '../DynamicIcon';

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { hasPermission } = useFirebase();
  const { modules, enabledModuleKeys, userPermissions } = useModules();

  const filteredModules = modules.filter(module => {
    // Check if company has enabled this module
    if (!enabledModuleKeys.includes(module.key)) return false;
    
    // Check if user has permission to view this module (module.view)
    const permissionKey = `${module.key}.view`;
    if (!userPermissions.includes(permissionKey)) return false;

    return true;
  });

  return (
    <aside className={cn(
      "bg-card border-l border-border flex flex-col h-full transition-all duration-500 ease-in-out relative z-40 group/sidebar",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md z-50 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "p-6 flex items-center gap-3 transition-all duration-300",
        isCollapsed && "px-4 justify-center"
      )}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 shrink-0">
          Q
        </div>
        {!isCollapsed && <span className="text-2xl font-black tracking-tighter text-primary animate-in fade-in duration-500">QAYD</span>}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {/* Dashboard - Always show if active */}
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
            location.pathname === '/dashboard'
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            isCollapsed && "justify-center"
          )}
        >
          <LayoutDashboard className={cn(
            "w-5 h-5 transition-colors shrink-0",
            location.pathname === '/dashboard' ? "text-primary" : "group-hover:text-primary"
          )} />
          {!isCollapsed && <span className="font-semibold text-sm animate-in fade-in duration-500">لوحة التحكم</span>}
        </Link>

        {/* Dynamic Modules */}
        {filteredModules.map((module) => {
          const isActive = location.pathname.startsWith(module.route);
          
          return (
            <div key={module.key} className="space-y-1">
              <Link
                to={module.route}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <DynamicIcon 
                  name={module.icon} 
                  className={cn(
                    "w-5 h-5 transition-colors shrink-0",
                    isActive ? "text-primary" : "group-hover:text-primary"
                  )} 
                />
                {!isCollapsed && (
                  <span className="font-semibold text-sm animate-in fade-in duration-500">
                    {module.name_ar}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full" />
                )}
              </Link>
            </div>
          );
        })}

        {/* Settings - Always show if permitted */}
        {hasPermission('settings.view') && (
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              location.pathname.startsWith('/settings')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className={cn(
              "w-5 h-5 transition-colors shrink-0",
              location.pathname.startsWith('/settings') ? "text-primary" : "group-hover:text-primary"
            )} />
            {!isCollapsed && <span className="font-semibold text-sm animate-in fade-in duration-500">الإعدادات</span>}
          </Link>
        )}
      </nav>

      {!isCollapsed && (
        <div className="px-6 py-4 mx-3 mb-2 rounded-2xl bg-slate-50 border border-slate-100 group/command cursor-pointer transition-all hover:border-primary/20" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/command:text-primary transition-colors">البحث الذكي</span>
            <div className="flex items-center gap-0.5">
              <span className="p-0.5 px-1 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-400">CTRL</span>
              <span className="p-0.5 px-1 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-400">K</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 line-clamp-1">ابحث عن أي شيء في قيد...</p>
        </div>
      )}

      <div className="p-4 border-t border-border mt-auto">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200",
          isCollapsed && "justify-center"
        )}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-semibold text-sm animate-in fade-in duration-500">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
