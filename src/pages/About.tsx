import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, Shield, Heart } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Brutally Honest',
    description: 'No sugar-coating. We tell you exactly what recruiters see in your resume and career profile.',
  },
  {
    icon: Zap,
    title: 'AI-Powered',
    description: 'Cutting-edge AI analyzes your resume, identifies skill gaps, and simulates real interviews.',
  },
  {
    icon: Shield,
    title: '100% Free',
    description: 'No hidden fees, no premium tiers, no payment required. Ever.',
  },
  {
    icon: Heart,
    title: 'Career-Focused',
    description: 'Every feature is designed to help you land your dream job faster.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Career Reality Engine</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to give job seekers the honest, actionable feedback they need to succeed.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Career Reality Engine was born from a simple frustration: most career advice is generic, 
              vague, and designed to make you feel good rather than help you improve. We built something different.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our AI doesn't tell you what you want to hear—it tells you what you need to hear. 
              Whether it's identifying the exact skills you're missing for your target role, 
              pointing out resume weaknesses that get you auto-rejected, or preparing you for 
              tough interview questions, we give you the unfiltered truth.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">The Team</h2>
          <p className="text-muted-foreground leading-relaxed">
            We're a small team of engineers, data scientists, and career coaches who believe 
            that everyone deserves access to high-quality career guidance—regardless of their 
            background or budget. That's why Career Reality Engine is, and always will be, 
            completely free.
          </p>
        </section>
      </main>
    </div>
  );
}
