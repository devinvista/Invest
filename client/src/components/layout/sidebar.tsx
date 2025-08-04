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
  Settings,
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
  { name: 'Configurações', href: '/settings', icon: Settings, current: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ isOpen, onClose, currentPath, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  // TODO: Buscar patrimônio líquido real do usuário via API
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
          "fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:w-72 lg:w-64 xl:w-72 bg-background border-r border-border shadow-lg lg:shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="lg:hidden p-3 flex justify-end border-b border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-muted rounded-lg"
              data-testid="button-sidebar-close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User profile section */}
          <div className="p-4 sm:p-5 lg:p-4 xl:p-6 border-b border-border/40">
            <div className="flex items-center space-x-3">
              <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-primary/20 shrink-0">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm lg:text-base truncate">{user?.name}</p>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">
                  Patrimônio: {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "nav-item w-full text-left group relative",
                    isActive && "active"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="sidebar-icon shrink-0" />
                  <span className="truncate text-sm lg:text-base">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 sm:p-4 lg:p-3 xl:p-4 border-t border-border/40">
            <Button 
              className="w-full rounded-xl pharos-gradient text-sm font-medium h-10 lg:h-11" 
              onClick={() => {/* TODO: Abrir modal de transação */}}
              data-testid="button-new-transaction"
            >
              <Plus className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Nova Transação</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
