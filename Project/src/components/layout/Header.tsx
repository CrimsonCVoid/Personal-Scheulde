import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Search, Plus, Sun, Moon, Monitor, User, Settings, LogOut } from 'lucide-react';
import { useEventsStore } from '@/features/events/store';
import { useSettingsStore } from '@/features/settings/store';
import { formatDate } from '@/lib/time';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const { setSelectedDate, selectedDate, view, setView } = useEventsStore();
  const { theme, setTheme } = useSettingsStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search
      console.log('Searching for:', searchQuery);
    }
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    navigate('/calendar');
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth-token');
    window.location.reload();
  };

  const toggleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setTheme({ mode: nextMode });
  };

  const ThemeIcon = theme.mode === 'dark' ? Moon : theme.mode === 'light' ? Sun : Monitor;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Schedule</span>
        </Link>

        {/* Today Button */}
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>

        {/* Current Date */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          {formatDate(selectedDate)}
        </div>

        {/* View Selector */}
        <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(v)}
              className="px-3 py-1 h-8 text-xs capitalize"
            >
              {v}
            </Button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </form>

        {/* Quick Add */}
        <Button size="sm" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4 mr-1" />
          New Event
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          <ThemeIcon className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}