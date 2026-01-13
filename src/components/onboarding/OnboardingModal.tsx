import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  Gamepad2,
  ArrowRight,
  Sparkles,
  Check,
  Rocket,
} from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to Career Reality',
    description: 'Your AI-powered career intelligence platform that gives you brutally honest feedback to accelerate your career growth.',
    color: 'from-primary to-accent',
  },
  {
    icon: FileText,
    title: 'Build Your Resume',
    description: 'Create professional, ATS-optimized resumes with AI suggestions for every section.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: BarChart3,
    title: 'Get Analyzed',
    description: 'Receive brutally honest feedback and scores on your resume, skills, and interview readiness.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Find Your Gaps',
    description: 'Identify exactly what skills you need for your target role and get a personalized learning path.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: MessageSquare,
    title: 'Practice Interviews',
    description: 'Simulate real interviews with our AI interviewer that provides instant feedback.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Gamepad2,
    title: 'Learn by Playing',
    description: 'Master coding through fun interactive games and earn XP, achievements, and climb leaderboards.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Rocket,
    title: "You're All Set!",
    description: 'Start your journey to career success. Your first step: build or upload your resume.',
    color: 'from-violet-500 to-purple-500',
  },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Progress */}
          <div className="px-6 pt-6">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <button onClick={skipOnboarding} className="hover:text-foreground transition-colors">
                Skip tour
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-3"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground max-w-sm mx-auto"
              >
                {step.description}
              </motion.p>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-8 bg-primary'
                        : idx < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action */}
          <div className="px-8 pb-8">
            <Button onClick={nextStep} className="w-full gap-2" size="lg">
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
