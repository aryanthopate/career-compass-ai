import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ResumeProvider } from "@/lib/ResumeContext";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { HelpButton } from "@/components/HelpButton";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import SkillGap from "./pages/SkillGap";
import Interview from "./pages/Interview";
import CareerVerdict from "./pages/CareerVerdict";
import Chat from "./pages/Chat";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import SharedResume from "./pages/SharedResume";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CodeShift from "./pages/CodeShift";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminGames from "./pages/admin/AdminGames";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function FloatingElements() {
  const location = useLocation();
  // Hide floating elements on these paths
  const hiddenPaths = [
    '/',           // Landing page
    '/chat',       // Chat page (has its own interface)
    '/admin',      // Admin pages
    '/auth',       // Auth page
    '/resume-builder',
    '/resume-analysis', 
    '/skill-gap',
    '/interview',
    '/career-verdict',
    '/games',
    '/profile',
    '/code-shift',
  ];
  
  const shouldHide = hiddenPaths.some(path => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  });
  
  if (shouldHide) return null;
  
  return (
    <>
      <FloatingChat />
      <HelpButton />
    </>
  );
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/code-shift" element={<ProtectedRoute><CodeShift /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/resume-analysis" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
        <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/career-verdict" element={<ProtectedRoute><CareerVerdict /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
        <Route path="/games/:language" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
        <Route path="/resume/:token" element={<SharedResume />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="games" element={<AdminGames />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingElements />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ResumeProvider>
              <AppContent />
            </ResumeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
