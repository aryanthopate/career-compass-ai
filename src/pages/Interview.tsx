import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResume, InterviewAttempt } from '@/lib/ResumeContext';
import {
  MessageSquare,
  Send,
  Loader2,
  Play,
  RotateCcw,
  User,
  Bot,
  CheckCircle,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const interviewQuestions = {
  technical: [
    "Tell me about a challenging technical problem you've solved recently.",
    "How do you approach debugging a complex issue?",
    "Explain the difference between REST and GraphQL APIs.",
    "What's your experience with version control systems?",
    "How do you ensure code quality in your projects?",
    "Describe your approach to learning new technologies.",
  ],
  behavioral: [
    "Tell me about yourself and why you're interested in this role.",
    "Describe a time when you had to work under pressure.",
    "How do you handle disagreements with team members?",
    "What's your biggest weakness and how are you working on it?",
    "Where do you see yourself in 5 years?",
  ],
};

export default function Interview() {
  const { interviewAttempts, saveInterviewAttempt, updateInterviewAttempt } = useResume();
  const [role, setRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [currentInterview, setCurrentInterview] = useState<InterviewAttempt | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentInterview?.messages]);

  const startInterview = () => {
    const firstQuestion =
      interviewQuestions.behavioral[0];

    const newInterview: Omit<InterviewAttempt, 'id' | 'createdAt'> = {
      role,
      experienceLevel,
      messages: [
        {
          role: 'interviewer',
          content: `Hello! I'm your AI interviewer today. We'll be conducting an interview for the ${role} position. Let's begin.\n\n${firstQuestion}`,
        },
      ],
      evaluation: null,
    };

    const saved = saveInterviewAttempt(newInterview);
    setCurrentInterview({
      ...newInterview,
      id: saved.id,
      createdAt: saved.createdAt,
    } as InterviewAttempt);
    setQuestionIndex(0);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !currentInterview) return;

    const updatedMessages = [
      ...currentInterview.messages,
      { role: 'user' as const, content: userInput },
    ];

    setCurrentInterview({
      ...currentInterview,
      messages: updatedMessages,
    });
    setUserInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const nextQuestionIndex = questionIndex + 1;
    const allQuestions = [...interviewQuestions.behavioral, ...interviewQuestions.technical];

    let response: string;

    if (nextQuestionIndex >= 5) {
      // End interview and evaluate
      response =
        "Thank you for your responses. Let me evaluate your interview performance...";

      const finalMessages = [
        ...updatedMessages,
        { role: 'interviewer' as const, content: response },
      ];

      // Generate evaluation
      const wordCount = updatedMessages
        .filter((m) => m.role === 'user')
        .reduce((acc, m) => acc + m.content.split(' ').length, 0);

      const avgResponseLength = wordCount / (nextQuestionIndex || 1);

      const evaluation = {
        confidenceScore: Math.min(95, Math.max(40, avgResponseLength * 2 + Math.random() * 20)),
        clarityScore: Math.min(95, Math.max(45, avgResponseLength * 1.8 + Math.random() * 25)),
        technicalScore: Math.min(90, Math.max(35, avgResponseLength * 1.5 + Math.random() * 30)),
        verdict: (avgResponseLength > 30
          ? 'hire'
          : avgResponseLength > 15
          ? 'borderline'
          : 'reject') as 'hire' | 'borderline' | 'reject',
        reasoning:
          avgResponseLength > 30
            ? 'Candidate demonstrated good communication skills and provided detailed responses. Shows potential for the role.'
            : avgResponseLength > 15
            ? 'Candidate shows potential but responses could be more detailed. Consider for further rounds with specific focus areas.'
            : 'Responses were too brief and lacked depth. Candidate may need more preparation before reapplying.',
      };

      setCurrentInterview({
        ...currentInterview,
        messages: finalMessages,
        evaluation,
      });

      updateInterviewAttempt(currentInterview.id, {
        messages: finalMessages,
        evaluation,
      });

      toast({
        title: 'Interview Complete',
        description: 'Your evaluation is ready.',
      });
    } else {
      // Follow-up or next question
      const followUps = [
        "That's interesting. Can you elaborate more on that?",
        "I see. Let me move to the next question.",
        "Thank you for sharing. Here's another question for you.",
      ];

      const followUp = followUps[Math.floor(Math.random() * followUps.length)];
      const nextQuestion = allQuestions[nextQuestionIndex] || interviewQuestions.technical[0];

      response = `${followUp}\n\n${nextQuestion}`;

      const newMessages = [
        ...updatedMessages,
        { role: 'interviewer' as const, content: response },
      ];

      setCurrentInterview({
        ...currentInterview,
        messages: newMessages,
      });

      updateInterviewAttempt(currentInterview.id, { messages: newMessages });
      setQuestionIndex(nextQuestionIndex);
    }

    setIsTyping(false);
  };

  const resetInterview = () => {
    setCurrentInterview(null);
    setQuestionIndex(0);
    setUserInput('');
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'hire':
        return {
          bg: 'bg-score-excellent/10',
          text: 'text-score-excellent',
          icon: CheckCircle,
        };
      case 'borderline':
        return {
          bg: 'bg-score-average/10',
          text: 'text-score-average',
          icon: MinusCircle,
        };
      default:
        return {
          bg: 'bg-destructive/10',
          text: 'text-destructive',
          icon: XCircle,
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">AI Interview Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Practice with an AI interviewer that challenges your responses
          </p>
        </div>

        {!currentInterview ? (
          <div className="max-w-lg mx-auto">
            <div className="glass-card p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-center mb-6">
                Start Your Interview
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Target Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Experience Level</Label>
                  <select
                    id="level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="fresher">Fresher (0-1 years)</option>
                    <option value="junior">Junior (1-2 years)</option>
                    <option value="mid">Mid-Level (2-4 years)</option>
                  </select>
                </div>

                <Button onClick={startInterview} className="w-full" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Begin Interview
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-6">
                You'll answer 5 questions covering technical and behavioral topics.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Interview Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Interview for <span className="font-medium text-foreground">{currentInterview.role}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetInterview}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Interview
              </Button>
            </div>

            {/* Chat Interface */}
            <div className="glass-card overflow-hidden">
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {currentInterview.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    } animate-fade-in`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!currentInterview.evaluation && (
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-3"
                  >
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response..."
                      disabled={isTyping}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!userInput.trim() || isTyping}>
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Evaluation Results */}
            {currentInterview.evaluation && (
              <div className="mt-6 space-y-4 animate-slide-up">
                <h3 className="font-semibold text-lg">Interview Evaluation</h3>

                {/* Verdict Card */}
                {(() => {
                  const styles = getVerdictStyles(currentInterview.evaluation.verdict);
                  const VerdictIcon = styles.icon;
                  return (
                    <div className={`glass-card p-6 ${styles.bg}`}>
                      <div className="flex items-center gap-4">
                        <VerdictIcon className={`w-12 h-12 ${styles.text}`} />
                        <div>
                          <div className={`text-2xl font-bold capitalize ${styles.text}`}>
                            {currentInterview.evaluation.verdict}
                          </div>
                          <p className="text-sm text-muted-foreground">Final Decision</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Scores */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Confidence', score: currentInterview.evaluation.confidenceScore },
                    { label: 'Clarity', score: currentInterview.evaluation.clarityScore },
                    { label: 'Technical', score: currentInterview.evaluation.technicalScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="glass-card p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(score)}%
                      </div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                <div className="glass-card p-6">
                  <h4 className="font-medium mb-2">Interviewer Notes</h4>
                  <p className="text-muted-foreground">
                    {currentInterview.evaluation.reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
