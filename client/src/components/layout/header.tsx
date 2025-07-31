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
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="btg-header fixed top-0 w-full z-50 h-16 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden hover:bg-white/20 rounded-lg transition-all duration-200"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-2 lg:ml-0">
              <PharosLogo />
            </div>
          </div>

          {/* Search and actions */}
          <div className="flex items-center space-x-4">
            {/* Search - hidden on small screens */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 bg-white/25 border-white/40 rounded-lg focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                />
                <Search className="absolute left-3 top-3 h-4 w-4" />
              </div>
            </form>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-white/20 rounded-lg transition-all duration-200">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-orange-500 text-white">
                3
              </Badge>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200">
                  <Avatar className="h-8 w-8 ring-2 ring-white/30">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
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
