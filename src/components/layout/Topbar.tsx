import { Bell, Search, User, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/components/FirebaseProvider';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user } = useFirebase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('')
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm group cursor-pointer" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="w-full h-10 pr-10 pl-12 bg-muted/50 rounded-xl border border-transparent hover:border-primary/20 transition-all flex items-center text-sm text-muted-foreground">
            بحث في النظام...
          </div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-black text-muted-foreground opacity-60">
            <span>CTRL</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="w-5 h-5" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-3">
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold">{user?.displayName || 'مستخدم'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.photoURL || ''} alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{userInitials}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'مستخدم'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
              <DropdownMenuItem>إعدادات الحساب</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
