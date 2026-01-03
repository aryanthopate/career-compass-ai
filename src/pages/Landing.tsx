import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';
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
  CheckCircle2,
  Users,
  TrendingUp,
  Shield,
  Bot,
  Zap,
  Star,
  Gamepad2,
  Code,
  Award,
  Rocket,
  Brain,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Globe,
  Clock,
  Heart,
  ThumbsUp,
  MousePointer2,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Craft professional resumes with AI-powered suggestions for each section',
    accent: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-500',
    link: '/resume-builder',
  },
  {
    icon: BarChart3,
    title: 'Reality Analyzer',
    description: 'Get brutally honest feedback and ATS compatibility scores',
    accent: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
    link: '/resume-analysis',
  },
  {
    icon: Target,
    title: 'Skill Gap Engine',
    description: 'Identify exactly what skills you need for your target role',
    accent: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
    link: '/skill-gap',
  },
  {
    icon: MessageSquare,
    title: 'Interview Simulator',
    description: 'Practice with AI interviewer that gives real-time feedback',
    accent: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
    link: '/interview',
  },
  {
    icon: Compass,
    title: 'Career Verdict',
    description: 'Your complete hiring probability dashboard',
    accent: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
    link: '/career-verdict',
  },
  {
    icon: Bot,
    title: 'AI Career Coach',
    description: 'Chat with AI for personalized career guidance anytime',
    accent: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-500',
    link: '/chat',
  },
  {
    icon: Gamepad2,
    title: 'Learn by Playing',
    description: 'Master coding through interactive games for HTML, CSS, JS, Python & more',
    accent: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-500',
    link: '/games',
  },
];

const stats = [
  { value: '10K+', label: 'Careers Analyzed', icon: Users },
  { value: '85%', label: 'Avg Score Increase', icon: TrendingUp },
  { value: '100%', label: 'Free Forever', icon: Shield },
  { value: '24/7', label: 'AI Available', icon: Bot },
];

const testimonials = [
  {
    quote: "Finally, career advice that doesn't sugarcoat reality. This tool told me exactly why I wasn't getting callbacks.",
    author: 'Priya S.',
    role: 'Software Engineer @ Google',
    rating: 5,
    avatar: 'PS',
  },
  {
    quote: "The interview simulator was brutal — in the best way. I walked into my actual interview feeling prepared.",
    author: 'Marcus J.',
    role: 'ML Engineer @ Meta',
    rating: 5,
    avatar: 'MJ',
  },
  {
    quote: "The skill gap analysis showed me exactly what to learn. Got my first developer job 3 months later.",
    author: 'Sarah K.',
    role: 'Frontend Developer @ Stripe',
    rating: 5,
    avatar: 'SK',
  },
  {
    quote: "Best career tool I've ever used. The AI feedback on my resume was incredibly accurate.",
    author: 'Alex R.',
    role: 'Data Scientist @ Netflix',
    rating: 5,
    avatar: 'AR',
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

const languages = [
  { name: 'HTML', color: 'from-orange-500 to-red-500' },
  { name: 'CSS', color: 'from-blue-500 to-purple-500' },
  { name: 'JavaScript', color: 'from-yellow-500 to-amber-500' },
  { name: 'TypeScript', color: 'from-blue-600 to-blue-400' },
  { name: 'Python', color: 'from-green-500 to-emerald-500' },
  { name: 'Rust', color: 'from-rose-500 to-red-600' },
];

const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Stripe', 'Airbnb'];

const processSteps = [
  { icon: FileText, title: 'Build Resume', description: 'Create your professional resume with AI assistance' },
  { icon: BarChart3, title: 'Get Analyzed', description: 'Receive brutally honest feedback and scores' },
  { icon: Target, title: 'Find Gaps', description: 'Identify exactly what skills you need' },
  { icon: Rocket, title: 'Land Job', description: 'Walk into interviews fully prepared' },
];

export default function Landing() {
  const containerRef = useScrollReveal();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden custom-scrollbar">
      <Header />

      {/* Hero Section - Enhanced */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Floating Orbs */}
          <motion.div 
            className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            }}
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 right-[10%] w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)',
            }}
            animate={{ 
              x: [0, -20, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
            }}
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div 
          className="container relative z-10 py-20"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm text-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-foreground/80">AI-powered career intelligence</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-score-excellent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-score-excellent"></span>
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-8"
              >
                <span className="block">Stop guessing.</span>
                <span className="block mt-2">
                  Start{' '}
                  <span className="relative">
                    <span className="gradient-text">knowing</span>
                    <motion.span 
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    />
                  </span>
                  .
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground leading-relaxed mb-10"
              >
                Your resume, interview skills, and career readiness — analyzed with
                brutal honesty by AI. No sugarcoating. No payments. Just truth.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/auth">
                  <Button size="xl" className="rounded-full group shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                    Get Your Reality Check
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="rounded-full gap-2 border-2">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-6 mt-12 pt-8 border-t border-border/50"
              >
                <div className="flex -space-x-3">
                  {['PS', 'MJ', 'SK', 'AR'].map((avatar, i) => (
                    <div key={avatar} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-background">
                      {avatar}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">10,000+ careers transformed</p>
                </div>
              </motion.div>
            </div>

            {/* Interactive Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl" />
              
              <div className="relative glass-card p-1 rounded-3xl overflow-hidden border border-primary/20">
                <div className="bg-card rounded-[calc(1.5rem-4px)] p-6 space-y-4">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Compass className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Career Dashboard</p>
                        <p className="text-xs text-muted-foreground">Live Analysis</p>
                      </div>
                    </div>
                    <Badge className="bg-score-excellent/10 text-score-excellent border-score-excellent/30">Ready</Badge>
                  </div>

                  {/* Score Circle */}
                  <div className="flex items-center justify-center py-6">
                    <div className="relative">
                      <svg className="w-36 h-36 -rotate-90">
                        <circle cx="72" cy="72" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                        <motion.circle 
                          cx="72" cy="72" r="60" fill="none" 
                          stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round"
                          strokeDasharray="377"
                          initial={{ strokeDashoffset: 377 }}
                          animate={{ strokeDashoffset: 377 * 0.15 }}
                          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          className="text-4xl font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.5 }}
                        >
                          85%
                        </motion.span>
                        <span className="text-xs text-muted-foreground">Hiring Probability</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Resume', value: '78%', color: 'text-blue-500' },
                      { label: 'Skills', value: '85%', color: 'text-emerald-500' },
                      { label: 'Interview', value: '92%', color: 'text-violet-500' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-muted/50 text-center">
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress Items */}
                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'ATS Compatibility', value: 92, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Skill Match', value: 78, color: 'from-blue-500 to-indigo-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span>{item.label}</span>
                          <span className="font-semibold">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 1.2, duration: 1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div 
                className="absolute -left-10 top-20 glass-card px-4 py-2 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-score-excellent" />
                  <span className="text-sm font-medium">ATS Optimized</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -right-6 bottom-32 glass-card px-4 py-2 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">AI Powered</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 1.5, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MousePointer2 className="w-5 h-5" />
            <span className="text-xs">Scroll to explore</span>
          </div>
        </motion.div>
      </section>

      {/* Animated Stats Bar */}
      <section className="py-16 border-y border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="reveal flex flex-col items-center text-center"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05)_0%,transparent_70%)]" />
        <div className="container relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 reveal">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 reveal" style={{ transitionDelay: '100ms' }}>
              From confused to{' '}
              <span className="gradient-text">confident</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto reveal" style={{ transitionDelay: '200ms' }}>
              Four simple steps to transform your career trajectory
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.title}
                    className="reveal-scale relative"
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="glass-card p-8 text-center h-full hover:border-primary/50 transition-colors group">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mb-16">
            <Badge variant="outline" className="mb-4 reveal">All Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 reveal" style={{ transitionDelay: '100ms' }}>
              Seven powerful tools.
              <br />
              <span className="text-muted-foreground">One mission: Get you hired.</span>
            </h2>
            <p className="text-lg text-muted-foreground reveal" style={{ transitionDelay: '200ms' }}>
              Every feature designed to give you an unfair advantage.
              No fluff. No motivational garbage. Just actionable intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="group block reveal-scale"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className={`relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm 
                    hover:border-primary/50 hover:bg-card transition-all duration-500 
                    overflow-hidden h-full`}>
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

      {/* Learn by Playing Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,hsl(var(--primary)/0.03)_49%,hsl(var(--primary)/0.03)_51%,transparent_52%)] bg-[size:60px_60px]" />
        </div>
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <Badge variant="outline" className="mb-4">New Feature</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Learn coding by{' '}
                <span className="gradient-text">playing games</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Master programming through interactive challenges. From HTML basics to advanced Rust — 
                level up your skills while having fun!
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {languages.map((lang) => (
                  <div
                    key={lang.name}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${lang.color} text-white text-sm font-medium shadow-lg`}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-xs text-muted-foreground">Challenges</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold">5K+</p>
                  <p className="text-xs text-muted-foreground">Players</p>
                </div>
              </div>

              <Link to="/games">
                <Button size="lg" className="rounded-full group">
                  Start Playing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="reveal-right relative">
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                
                <div className="relative space-y-6">
                  {/* Code Challenge Preview */}
                  <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <pre className="text-zinc-300">
                      <code>{`<button class="btn">
  Click me!
</button>`}</code>
                    </pre>
                  </div>

                  {/* XP Progress */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">HTML Level 5</span>
                      <span className="text-sm text-muted-foreground">420 / 500 XP</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[84%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                    </div>
                  </div>

                  {/* Achievement */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Achievement Unlocked!</p>
                      <p className="text-sm text-muted-foreground">First HTML Challenge Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
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
                    className="flex items-center gap-3"
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

            <div className="reveal-right relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
              <div className="relative glass-card p-8 rounded-3xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-background/50 text-center hover:scale-105 transition-transform">
                    <div className="text-4xl font-bold gradient-text mb-1">7</div>
                    <div className="text-sm text-muted-foreground">Powerful Tools</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center hover:scale-105 transition-transform">
                    <div className="text-4xl font-bold gradient-text mb-1">AI</div>
                    <div className="text-sm text-muted-foreground">Powered Analysis</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center hover:scale-105 transition-transform">
                    <div className="text-4xl font-bold gradient-text mb-1">$0</div>
                    <div className="text-sm text-muted-foreground">Hidden Costs</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/50 text-center hover:scale-105 transition-transform">
                    <div className="text-4xl font-bold gradient-text mb-1">∞</div>
                    <div className="text-sm text-muted-foreground">Possibilities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 reveal">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 reveal" style={{ transitionDelay: '100ms' }}>
              Real feedback from real people
            </h2>
            <p className="text-muted-foreground text-lg reveal" style={{ transitionDelay: '200ms' }}>
              Who used our brutal honesty to land their dream jobs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className="reveal-scale glass-card p-6 relative"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                
                <p className="text-sm leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Company logos */}
          <div className="mt-16 pt-16 border-t border-border/30">
            <p className="text-center text-sm text-muted-foreground mb-8 reveal">
              Our users work at top companies worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {companies.map((company, i) => (
                <span 
                  key={company} 
                  className="text-xl md:text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors reveal"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-96 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 reveal">Get Started</Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 reveal" style={{ transitionDelay: '100ms' }}>
              Ready to face your
              <br />
              career reality?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 reveal" style={{ transitionDelay: '200ms' }}>
              Join thousands who chose truth over comfort.
              <br />
              And landed their dream jobs.
            </p>
            <div className="reveal" style={{ transitionDelay: '300ms' }}>
              <Link to="/auth">
                <Button size="xl" className="rounded-full shadow-glow group text-lg px-12">
                  Get Started — It's Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6 reveal" style={{ transitionDelay: '400ms' }}>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Compass className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold">Career Reality Engine</div>
                <div className="text-xs text-muted-foreground">Brutal honesty. Real results.</div>
              </div>
            </Link>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Career Reality. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
