import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useAdmin } from '@/lib/useAdmin';
import {
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  LogOut,
  User,
  ChevronDown,
  Bot,
  Home,
  Shield,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

const productItems = [
  { 
    path: '/resume-builder', 
    label: 'Resume Builder', 
    icon: FileText,
    description: 'Create professional resumes with AI assistance',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  { 
    path: '/resume-analysis', 
    label: 'Resume Analysis', 
    icon: BarChart3,
    description: 'Get brutally honest feedback on your resume',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  { 
    path: '/skill-gap', 
    label: 'Skill Gap Analysis', 
    icon: Target,
    description: 'Identify missing skills for your target role',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  { 
    path: '/interview', 
    label: 'Mock Interview', 
    icon: MessageSquare,
    description: 'Practice interviews with AI feedback',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  { 
    path: '/career-verdict', 
    label: 'Career Verdict', 
    icon: Compass,
    description: 'Get your overall career readiness score',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Career Reality</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Home */}
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-1.5"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>

          {/* Products Dropdown */}
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                Products
                <ChevronDown className="w-4 h-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-96 p-3" align="start">
              <div className="grid gap-1">
                {productItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <div className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive ? 'bg-primary/10' : 'hover:bg-secondary'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </HoverCardContent>
          </HoverCard>

          {/* AI Chats */}
          <Link to="/chat">
            <Button 
              variant={location.pathname === '/chat' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-1.5"
            >
              <Bot className="w-4 h-4" />
              AI Chats
            </Button>
          </Link>

          {/* Admin Link */}
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1.5 text-destructive"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {user ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm max-w-32 truncate">
                      {user.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
                    <User className="w-4 h-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')} className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="shadow-sm">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/' ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            
            <div className="h-px bg-border my-2" />
            
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
              Products
            </p>
            {productItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="h-px bg-border my-2" />
            
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/chat' ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Bot className="w-4 h-4" />
                AI Chats
              </Button>
            </Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/profile' ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <User className="w-4 h-4" />
                My Profile
              </Button>
            </Link>
            
            {isAdmin && (
              <>
                <div className="h-px bg-border my-2" />
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
