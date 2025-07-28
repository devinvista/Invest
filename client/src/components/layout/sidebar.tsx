import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/financial-utils';
import {
  Home,
  Calculator,
  Building2,
  CreditCard,
  TrendingUp,
  Target,
  BarChart3,
  GraduationCap,
  Plus,
  X,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, current: true },
  { name: 'Orçamento', href: '/budget', icon: Calculator, current: false },
  { name: 'Contas Bancárias', href: '/accounts', icon: Building2, current: false },
  { name: 'Cartões', href: '/cards', icon: CreditCard, current: false },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp, current: false },
  { name: 'Metas', href: '/goals', icon: Target, current: false },
  { name: 'Relatórios', href: '/reports', icon: BarChart3, current: false },
  { name: 'Educação', href: '/education', icon: GraduationCap, current: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ isOpen, onClose, currentPath, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  // TODO: Fetch user's actual net worth from API
  const netWorth = 125450;

  const handleNavigation = (path: string) => {
    onNavigate(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-md border-r border-border/40 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="lg:hidden p-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User profile section */}
          <div className="p-6 border-b border-border/40">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Patrimônio: {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "nav-item w-full text-left",
                    isActive && "active"
                  )}
                >
                  <item.icon className="sidebar-icon" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-border/40">
            <Button className="w-full rounded-xl pharos-gradient" onClick={() => {/* TODO: Open transaction modal */}}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
