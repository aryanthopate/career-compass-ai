import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  ArrowRight,
  CheckCircle2,
  Zap,
  Brain,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description: 'Build professional resumes with AI-powered suggestions for every section.',
  },
  {
    icon: BarChart3,
    title: 'Reality Analyzer',
    description: 'Get brutally honest feedback on your resume with ATS risk detection.',
  },
  {
    icon: Target,
    title: 'Skill Gap Engine',
    description: 'Discover exactly what skills you need for your target role.',
  },
  {
    icon: MessageSquare,
    title: 'Interview Simulator',
    description: 'Practice with an AI interviewer that challenges your responses.',
  },
  {
    icon: Compass,
    title: 'Career Verdict',
    description: 'Get your hiring probability and clear next steps.',
  },
];

const benefits = [
  '100% Free - No payments ever',
  'AI-powered analysis & feedback',
  'Real interview simulation',
  'Honest career guidance',
  'Download resume as PDF',
  'Save all your progress',
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative pt-20 pb-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              AI-Driven Career Intelligence
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Your Career Reality,
              <span className="gradient-text"> Revealed by AI</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              Build resumes, analyze your chances, simulate interviews, and get honest 
              career guidance — all powered by AI, completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Building Your Career
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              {benefits.slice(0, 3).map((benefit) => (
                <span key={benefit} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Five powerful AI-driven tools designed specifically for engineering 
              students and fresh graduates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card p-6 hover:shadow-medium transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
            
            {/* Coming Soon Card */}
            <div className="glass-card p-6 border-dashed opacity-60">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Career Recommendations</h3>
              <p className="text-muted-foreground">AI-powered role suggestions based on your profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                No Fluff. No Payments.
                <br />
                <span className="gradient-text">Just Real Career Guidance.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We built Career Reality Engine for one purpose: to give you an honest, 
                AI-powered assessment of your career readiness. No subscriptions, 
                no premium tiers, no hidden costs.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-8 relative">
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  AI-Powered
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-muted-foreground text-sm">Hiring Probability</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resume Score</span>
                    <span className="font-medium">78/100</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interview Ready</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Face Your Career Reality?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of engineering students who are building better 
              careers with AI-powered guidance.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Compass className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">Career Reality Engine</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Career Reality Engine. Free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
