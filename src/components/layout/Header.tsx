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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useAdmin } from '@/lib/useAdmin';
import {
  Moon,
  Sun,
  Menu,
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
  Gamepad2,
  ChevronRight,
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
  { 
    path: '/games', 
    label: 'Learn by Playing', 
    icon: Gamepad2,
    description: 'Master coding through fun interactive games',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
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
    setMobileMenuOpen(false);
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

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
              {/* User Menu - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3 hidden sm:flex">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm max-w-32 truncate">
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

              {/* Mobile Drawer */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Welcome back!</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <ScrollArea className="h-[calc(100vh-180px)]">
                    <div className="p-4 space-y-2">
                      {/* Home */}
                      <Link to="/" onClick={closeMobileMenu}>
                        <Button variant={location.pathname === '/' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12">
                          <Home className="w-5 h-5" />
                          Home
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </Link>

                      <div className="py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                          Products
                        </p>
                        {productItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          return (
                            <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
                              <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12 mb-1"
                              >
                                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                                  <Icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                              </Button>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="h-px bg-border" />

                      {/* AI Chats */}
                      <Link to="/chat" onClick={closeMobileMenu}>
                        <Button variant={location.pathname === '/chat' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12">
                          <Bot className="w-5 h-5" />
                          AI Chats
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </Link>

                      {/* Profile */}
                      <Link to="/profile" onClick={closeMobileMenu}>
                        <Button variant={location.pathname === '/profile' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12">
                          <User className="w-5 h-5" />
                          My Profile
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </Link>

                      {/* Settings */}
                      <Link to="/profile?tab=settings" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                          <Settings className="w-5 h-5" />
                          Settings
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </Link>

                      {/* Admin */}
                      {isAdmin && (
                        <>
                          <div className="h-px bg-border my-2" />
                          <Link to="/admin" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive">
                              <Shield className="w-5 h-5" />
                              Admin Panel
                              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Bottom Sign Out */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                    <Button variant="outline" onClick={handleSignOut} className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              {/* Mobile Menu for non-logged in users */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-2">
                    <Link to="/" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <Home className="w-5 h-5" />
                        Home
                      </Button>
                    </Link>
                    <div className="py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Products</p>
                      {productItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 mb-1">
                              <Icon className={`w-4 h-4 ${item.color}`} />
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                    <Link to="/auth" onClick={closeMobileMenu}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              <Link to="/auth" className="hidden lg:block">
                <Button size="sm" className="shadow-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}