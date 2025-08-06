import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PharosLogo } from '@/components/ui/pharos-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Menu, User, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
  onToggleSidebar: () => void;
  onCollapseSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, onCollapseSidebar, sidebarCollapsed = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar funcionalidade de pesquisa
    console.log('Pesquisando por:', searchQuery);
  };

  return (
    <header className="btg-header fixed top-0 w-full z-50 h-16 shadow-sm">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu */}
          <div className="flex items-center min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-all duration-200 shrink-0"
              onClick={onToggleSidebar}
              data-testid="button-menu-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop sidebar collapse button */}
            {onCollapseSidebar && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex p-2 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-all duration-200 shrink-0"
                onClick={onCollapseSidebar}
                data-testid="button-sidebar-collapse"
                title={sidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            )}
            <div className="ml-2 lg:ml-0 shrink-0">
              <PharosLogo />
            </div>
          </div>

          {/* Search and actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
            {/* Search - responsive sizing */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 sm:w-40 md:w-48 lg:w-64 pl-8 sm:pl-10 text-sm bg-black/5 border-black/20 dark:bg-white/20 dark:border-white/30 rounded-lg focus:bg-black/10 focus:border-black/30 dark:focus:bg-white/30 dark:focus:border-white/50 transition-all duration-200"
                  data-testid="input-search"
                />
                <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
            </form>

            {/* Mobile search button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden p-2 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
              onClick={handleSearch}
              data-testid="button-search-mobile"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle - hide on very small screens */}
            <div className="hidden xs:block">
              <ThemeToggle />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs bg-orange-500 text-white">
                3
              </Badge>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-black/20 dark:ring-white/30">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-primary text-white font-semibold text-xs sm:text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium max-w-24 truncate">
                    {user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="text-sm">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
