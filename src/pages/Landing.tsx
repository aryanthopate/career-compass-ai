import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';
import {
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  ArrowRight,
  Sparkles,
  Quote,
  ArrowUpRight,
  Play,
  Moon,
  Sun,
  CheckCircle2,
  Users,
  TrendingUp,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Craft professional resumes with AI-powered suggestions for each section',
    accent: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Reality Analyzer',
    description: 'Get brutally honest feedback and ATS compatibility scores',
    accent: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Target,
    title: 'Skill Gap Engine',
    description: 'Identify exactly what skills you need for your target role',
    accent: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
  },
  {
    icon: MessageSquare,
    title: 'Interview Simulator',
    description: 'Practice with AI interviewer that gives real-time feedback',
    accent: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
  },
  {
    icon: Compass,
    title: 'Career Verdict',
    description: 'Your complete hiring probability dashboard',
    accent: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
  },
];

const stats = [
  { value: '10K+', label: 'Careers Analyzed', icon: Users },
  { value: '85%', label: 'Avg Score Increase', icon: TrendingUp },
  { value: '100%', label: 'Free Forever', icon: Shield },
];

const testimonials = [
  {
    quote: "Finally, career advice that doesn't sugarcoat reality. This tool told me exactly why I wasn't getting callbacks.",
    author: 'Priya S.',
    role: 'Software Engineer @ Google',
  },
  {
    quote: "The interview simulator was brutal — in the best way. I walked into my actual interview feeling prepared.",
    author: 'Marcus J.',
    role: 'ML Engineer @ Meta',
  },
  {
    quote: "The skill gap analysis showed me exactly what to learn. Got my first developer job 3 months later.",
    author: 'Sarah K.',
    role: 'Frontend Developer @ Stripe',
  },
];

const benefits = [
  'AI-powered resume analysis with ATS scoring',
  'Personalized skill gap identification',
  'Mock interviews with real-time feedback',
  'Career trajectory predictions',
  'Unlimited resume versions',
  'No credit card required',
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Career Reality</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Link to="/auth">
              <Button className="shadow-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="container relative z-10">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">AI-powered career intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-score-excellent animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.9] mb-8 animate-slide-up">
              <span className="block">Stop guessing.</span>
              <span className="block mt-2">
                Start <span className="gradient-text">knowing</span>.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Your resume, interview skills, and career readiness — analyzed with
              brutal honesty by AI. No sugarcoating. No payments. Just truth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full group shadow-lg">
                  Get Your Reality Check
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Card */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 animate-float">
          <div className="glass-card p-6 w-72 backdrop-blur-xl">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Live Analysis</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>Resume Strength</span>
                  <span className="font-semibold text-primary">78%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>Interview Ready</span>
                  <span className="font-semibold text-accent">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-gradient-to-r from-accent to-score-excellent rounded-full" />
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="text-3xl font-bold gradient-text">85%</div>
                <div className="text-sm text-muted-foreground">Hiring Probability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-center gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Five powerful tools.
              <br />
              <span className="text-muted-foreground">One mission: Get you hired.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Every feature designed to give you an unfair advantage.
              No fluff. No motivational garbage. Just actionable intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to="/auth"
                  className="group block"
                >
                  <div
                    className={`relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm 
                    hover:border-primary/50 hover:bg-card transition-all duration-500 
                    animate-slide-up overflow-hidden h-full`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Everything you need.
                <br />
                <span className="text-muted-foreground">Nothing you don't.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We built the career toolkit we wished we had.
                Simple, honest, and completely free.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-score-excellent flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link to="/auth">
                  <Button size="lg" className="rounded-full group">
                    Start Free Today
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
              <div className="relative glass-card p-8 rounded-3xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-background/50 text-center">
                    <div className="text-4xl font-bold gradient-text mb-1">5</div>
                    <div className="text-sm text-muted-foreground">Powerful Tools</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center">
                    <div className="text-4xl font-bold gradient-text mb-1">AI</div>
                    <div className="text-sm text-muted-foreground">Powered Analysis</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center">
                    <div className="text-4xl font-bold gradient-text mb-1">0</div>
                    <div className="text-sm text-muted-foreground">Hidden Costs</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center">
                    <div className="text-4xl font-bold gradient-text mb-1">∞</div>
                    <div className="text-sm text-muted-foreground">Possibilities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Real feedback from real people
            </h2>
            <p className="text-muted-foreground text-lg">
              Who used our brutal honesty to land their dream jobs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className="glass-card p-8 relative animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                <p className="text-lg leading-relaxed mb-6 relative z-10">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-96 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Ready to face your
              <br />
              career reality?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands who chose truth over comfort.
              <br />
              And landed their dream jobs.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-10 py-7 rounded-full shadow-glow group">
                Get Started — It's Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card. No hidden fees. No BS.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Compass className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold">Career Reality Engine</div>
                <div className="text-sm text-muted-foreground">AI-powered career intelligence</div>
              </div>
            </Link>

            <nav className="flex flex-wrap justify-center gap-8 text-sm">
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </nav>

            <p className="text-muted-foreground text-sm">
              © 2024 Career Reality Engine. Free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
