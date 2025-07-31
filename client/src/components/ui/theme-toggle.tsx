import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center">
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {theme === 'light' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center">
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
          {theme === 'dark' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center">
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
          {theme === 'system' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}