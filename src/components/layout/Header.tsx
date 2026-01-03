import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
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
  Info,
  Mail,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

const productItems = [
  { 
    path: '/resume-builder', 
    label: 'Resume Builder', 
    icon: FileText,
    description: 'Create professional resumes with AI assistance'
  },
  { 
    path: '/resume-analysis', 
    label: 'Resume Analysis', 
    icon: BarChart3,
    description: 'Get brutally honest feedback on your resume'
  },
  { 
    path: '/skill-gap', 
    label: 'Skill Gap Analysis', 
    icon: Target,
    description: 'Identify missing skills for your target role'
  },
  { 
    path: '/interview', 
    label: 'Mock Interview', 
    icon: MessageSquare,
    description: 'Practice interviews with AI feedback'
  },
  { 
    path: '/career-verdict', 
    label: 'Career Verdict', 
    icon: Compass,
    description: 'Get your overall career readiness score'
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/resume-builder' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Career Reality Engine</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Products Dropdown */}
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                Products
                <ChevronDown className="w-4 h-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-2" align="start">
              <div className="grid gap-1">
                {productItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                      }`}>
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
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
              className="gap-1"
            >
              <Bot className="w-4 h-4" />
              AI Chats
            </Button>
          </Link>

          {/* About */}
          <Link to="/about">
            <Button 
              variant={location.pathname === '/about' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-1"
            >
              <Info className="w-4 h-4" />
              About
            </Button>
          </Link>

          {/* Contact */}
          <Link to="/contact">
            <Button 
              variant={location.pathname === '/contact' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-1"
            >
              <Mail className="w-4 h-4" />
              Contact
            </Button>
          </Link>

          {/* Admin Link */}
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1 text-destructive"
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate max-w-32">
                  {user.email}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
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
              <Button variant="default" size="sm">
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
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="h-px bg-border my-2" />
            
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/chat' ? 'secondary' : 'ghost'} className="w-full justify-start">
                <Bot className="w-4 h-4 mr-2" />
                AI Chats
              </Button>
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/about' ? 'secondary' : 'ghost'} className="w-full justify-start">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={location.pathname === '/contact' ? 'secondary' : 'ghost'} className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </Link>
            
            {isAdmin && (
              <>
                <div className="h-px bg-border my-2" />
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-destructive">
                    <Shield className="w-4 h-4 mr-2" />
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
