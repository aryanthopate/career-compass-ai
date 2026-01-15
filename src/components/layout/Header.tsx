import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/AuthContext';
import { useAdmin } from '@/lib/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown,
  Home,
  Settings,
  ShieldCheck,
  Compass,
  Bot,
  ChevronRight,
  FileText,
  Target,
  MessageSquare,
  BarChart3,
  Gamepad2,
  Code,
  Sparkles,
  Zap,
  Presentation,
} from 'lucide-react';

// Old products - existing career tools
const oldProductItems = [
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

// New products - engineering tools
const newProductItems = [
  { 
    path: '/code-shift', 
    label: 'Code Shift', 
    icon: Code,
    description: 'Convert code between languages, preserving logic',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    isNew: true,
  },
  { 
    path: '/ppt-generator', 
    label: 'PPT Generator', 
    icon: Presentation,
    description: 'Create stunning presentations with AI magic',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    isNew: true,
  },
];

// Combined for mobile
const allProductItems = [...newProductItems, ...oldProductItems];

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string | null | undefined, email: string | undefined): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const renderProductItem = (item: typeof oldProductItems[0] & { isNew?: boolean }, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
        isActive ? 'bg-primary/10' : 'hover:bg-secondary'
      }`}>
        <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${item.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{item.label}</p>
            {item.isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary to-violet-500 text-white rounded-full uppercase tracking-wide">
                New
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      </div>
    );
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
            <HoverCardContent className="w-[600px] p-4" align="start">
              <div className="grid grid-cols-2 gap-6">
                {/* New Products Column */}
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">New Products</span>
                  </div>
                  <div className="space-y-1">
                    {newProductItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link key={item.path} to={item.path}>
                          {renderProductItem(item, isActive)}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Old Products Column */}
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Career Tools</span>
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {oldProductItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link key={item.path} to={item.path}>
                          {renderProductItem(item, isActive)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
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

          {/* Admin Panel */}
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {/* User Menu - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3 hidden sm:flex">
                    <Avatar className="w-7 h-7">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(profile?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm max-w-32 truncate">
                      {getDisplayName()}
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
                        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(profile?.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{getDisplayName()}</p>
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

                      {/* New Products */}
                      <div className="py-2">
                        <div className="flex items-center gap-2 px-3 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                            New Products
                          </p>
                        </div>
                        {newProductItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          return (
                            <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
                              <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12"
                              >
                                <Icon className={`w-5 h-5 ${item.color}`} />
                                <div className="flex items-center gap-2">
                                  {item.label}
                                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary to-violet-500 text-white rounded-full">
                                    NEW
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Career Tools */}
                      <div className="py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                          Career Tools
                        </p>
                        {oldProductItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          return (
                            <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
                              <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12"
                              >
                                <Icon className={`w-5 h-5 ${item.color}`} />
                                {item.label}
                                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </Link>
                          );
                        })}
                      </div>

                      {/* AI Chats */}
                      <Link to="/chat" onClick={closeMobileMenu}>
                        <Button variant={location.pathname === '/chat' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12">
                          <Bot className="w-5 h-5" />
                          AI Chats
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </Link>

                      {/* Admin Panel */}
                      {isAdmin && (
                        <Link to="/admin" onClick={closeMobileMenu}>
                          <Button variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12 text-primary">
                            <ShieldCheck className="w-5 h-5" />
                            Admin Panel
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Bottom actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2" onClick={() => { navigate('/profile'); closeMobileMenu(); }}>
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                      <Button variant="destructive" className="flex-1 gap-2" onClick={() => { handleSignOut(); closeMobileMenu(); }}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button className="gap-2">
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu for Non-logged users */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    <Link to="/" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Home className="w-4 h-4" />
                        Home
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={closeMobileMenu}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
