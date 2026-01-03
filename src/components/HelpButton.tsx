import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HelpCircle,
  X,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  Bot,
  ChevronRight,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const helpItems = [
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Create and edit your professional resume with AI assistance',
    path: '/resume-builder',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Resume Analysis',
    description: 'Get honest feedback and ATS compatibility scores',
    path: '/resume-analysis',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Identify skills you need for your target role',
    path: '/skill-gap',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview',
    description: 'Practice with AI interviewer and get scored',
    path: '/interview',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Compass,
    title: 'Career Verdict',
    description: 'See your overall hiring probability',
    path: '/career-verdict',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Bot,
    title: 'AI Chat',
    description: 'Ask career questions anytime',
    path: '/chat',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

const tips = [
  'Start by creating your resume in Resume Builder',
  'Run Analysis to get honest feedback on improvements',
  'Use Skill Gap to identify missing competencies',
  'Practice interviews to boost confidence',
  'Check Career Verdict for your hiring probability',
];

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-lg z-40 border-2 hover:scale-110 transition-transform"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Help Panel */}
          <Card className="fixed bottom-6 right-6 w-[380px] max-h-[85vh] z-50 shadow-2xl border-border overflow-hidden animate-scale-in">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Help Center</CardTitle>
                    <p className="text-sm text-muted-foreground">Quick guide to features</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="max-h-[calc(85vh-80px)]">
              <CardContent className="p-4 space-y-6">
                {/* Features */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Features
                  </h3>
                  <div className="space-y-2">
                    {helpItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                        >
                          <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-primary" />
                    Quick Start Tips
                  </h3>
                  <ol className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Support */}
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    Need more help?{' '}
                    <Link to="/contact" onClick={() => setIsOpen(false)} className="text-primary hover:underline">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </>
      )}
    </>
  );
}
