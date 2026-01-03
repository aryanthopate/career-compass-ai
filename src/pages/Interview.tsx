import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useResume, InterviewAttempt } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
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
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Award,
  Mic,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const roles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'ML Engineer',
];

const experienceLevels = [
  { value: 'fresher', label: 'Fresher (0-1 years)', questions: 5 },
  { value: 'junior', label: 'Junior (1-2 years)', questions: 6 },
  { value: 'mid', label: 'Mid-Level (2-4 years)', questions: 7 },
];

export default function Interview() {
  const { interviewAttempts, saveInterviewAttempt, updateInterviewAttempt } = useResume();
  const [role, setRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [currentInterview, setCurrentInterview] = useState<InterviewAttempt | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxQuestions = experienceLevels.find(l => l.value === experienceLevel)?.questions || 5;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentInterview?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [userInput]);

  const callAI = async (messages: { role: string; content: string }[]) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a professional interviewer conducting a ${role} interview for a ${experienceLevel} level candidate. 
Ask relevant technical and behavioral questions. Be professional but challenging.
After the candidate answers, provide brief feedback and ask the next question.
Keep responses concise - 2-3 sentences of feedback, then the next question.
If this is the final question (question ${maxQuestions}), instead of asking another question, provide a brief overall evaluation summary.`
          },
          ...messages.map(m => ({ role: m.role === 'interviewer' ? 'assistant' : 'user', content: m.content }))
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          } catch {}
        }
      }
    }

    return fullResponse;
  };

  const startInterview = async () => {
    setIsTyping(true);

    try {
      const systemMessage = `Hello! I'm your AI interviewer today. I'll be conducting an interview for the ${role} position (${experienceLevels.find(l => l.value === experienceLevel)?.label}).

We'll go through ${maxQuestions} questions covering both technical and behavioral aspects. Take your time to answer thoughtfully.

Let's begin with our first question:

Tell me about yourself and why you're interested in this ${role} role.`;

      const newInterview: Omit<InterviewAttempt, 'id' | 'createdAt'> = {
        role,
        experienceLevel,
        messages: [{ role: 'interviewer', content: systemMessage }],
        evaluation: null,
      };

      const saved = await saveInterviewAttempt(newInterview);
      if (saved) {
        setCurrentInterview(saved);
      }
      setQuestionCount(1);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to start interview', variant: 'destructive' });
    }
    
    setIsTyping(false);
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

    try {
      const aiResponse = await callAI(updatedMessages);
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      const finalMessages = [
        ...updatedMessages,
        { role: 'interviewer' as const, content: aiResponse },
      ];

      // Check if interview is complete
      if (newQuestionCount > maxQuestions) {
        // Generate evaluation
        const wordCount = updatedMessages
          .filter((m) => m.role === 'user')
          .reduce((acc, m) => acc + m.content.split(' ').length, 0);

        const avgResponseLength = wordCount / questionCount;
        const detailScore = Math.min(95, avgResponseLength * 2 + 20);
        
        const evaluation = {
          confidenceScore: Math.min(95, Math.max(45, detailScore + Math.random() * 15)),
          clarityScore: Math.min(95, Math.max(50, detailScore - 5 + Math.random() * 20)),
          technicalScore: Math.min(90, Math.max(40, detailScore - 10 + Math.random() * 25)),
          verdict: (detailScore > 70 ? 'hire' : detailScore > 50 ? 'borderline' : 'reject') as 'hire' | 'borderline' | 'reject',
          reasoning: aiResponse,
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

        toast({ title: 'Interview Complete', description: 'Your evaluation is ready.' });
      } else {
        setCurrentInterview({
          ...currentInterview,
          messages: finalMessages,
        });

        updateInterviewAttempt(currentInterview.id, { messages: finalMessages });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to get response', variant: 'destructive' });
    }

    setIsTyping(false);
  };

  const resetInterview = () => {
    setCurrentInterview(null);
    setQuestionCount(0);
    setUserInput('');
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'hire':
        return { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent', icon: CheckCircle, label: 'Strong Hire' };
      case 'borderline':
        return { bg: 'bg-score-average/10', text: 'text-score-average', border: 'border-score-average', icon: MinusCircle, label: 'Borderline' };
      default:
        return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive', icon: XCircle, label: 'Not Ready' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            AI Interview Simulator
          </h1>
          <p className="text-muted-foreground mt-2">
            Practice with an AI interviewer that challenges your responses and provides real feedback
          </p>
        </div>

        {!currentInterview ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Setup Card */}
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-pink-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Start Your Interview</h2>
                  <p className="text-muted-foreground">
                    Configure your interview settings
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Target Role</Label>
                    <div className="flex flex-wrap gap-2">
                      {roles.slice(0, 6).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            role === r
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Or type custom role..."
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setExperienceLevel(level.value)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            experienceLevel === level.value
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <div className="text-sm font-medium">{level.label.split(' ')[0]}</div>
                          <div className="text-xs opacity-80">{level.questions} questions</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={startInterview} className="w-full" size="lg" disabled={isTyping}>
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    Begin Interview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    What to Expect
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <span>Answer {maxQuestions} questions covering technical and behavioral topics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <span>Receive real-time feedback on each response</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <span>Get a final evaluation with detailed scores</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-score-good" />
                    Tips for Success
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use the STAR method for behavioral questions</li>
                    <li>• Be specific with examples from your experience</li>
                    <li>• Keep responses focused but detailed (50-150 words)</li>
                    <li>• Don't be afraid to ask for clarification</li>
                  </ul>
                </CardContent>
              </Card>

              {interviewAttempts.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      Previous Attempts ({interviewAttempts.length})
                    </h3>
                    <div className="space-y-2">
                      {interviewAttempts.slice(-3).reverse().map((attempt, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/30">
                          <span>{attempt.role}</span>
                          {attempt.evaluation && (
                            <Badge variant={attempt.evaluation.verdict === 'hire' ? 'default' : 'secondary'}>
                              {attempt.evaluation.verdict}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interview Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <Mic className="w-3 h-3" />
                  Live Interview
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentInterview.role} • Question {Math.min(questionCount, maxQuestions)} of {maxQuestions}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={resetInterview}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Interview
              </Button>
            </div>

            {/* Progress */}
            <Progress value={(questionCount / maxQuestions) * 100} className="h-2" />

            {/* Chat Interface */}
            <Card className="glass-card overflow-hidden">
              <div className="h-[450px] overflow-y-auto p-6 space-y-6">
                {currentInterview.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/80'
                          : 'bg-gradient-to-br from-pink-500 to-rose-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-md'
                          : 'bg-card border border-border rounded-tl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-md">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!currentInterview.evaluation && (
                <div className="p-4 border-t border-border bg-background/50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-3"
                  >
                    <Textarea
                      ref={textareaRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your response... (Shift+Enter for new line)"
                      disabled={isTyping}
                      className="flex-1 min-h-[52px] max-h-[150px] resize-none"
                      rows={1}
                    />
                    <Button type="submit" size="icon" className="h-[52px] w-[52px]" disabled={!userInput.trim() || isTyping}>
                      {isTyping ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </Card>

            {/* Evaluation Results */}
            {currentInterview.evaluation && (
              <div className="space-y-6 animate-slide-up">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Interview Evaluation
                </h3>

                {/* Verdict Card */}
                {(() => {
                  const styles = getVerdictStyles(currentInterview.evaluation.verdict);
                  const VerdictIcon = styles.icon;
                  return (
                    <Card className={`${styles.bg} border-2 ${styles.border}`}>
                      <CardContent className="p-6 flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl ${styles.bg} flex items-center justify-center`}>
                          <VerdictIcon className={`w-8 h-8 ${styles.text}`} />
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${styles.text}`}>
                            {styles.label}
                          </div>
                          <p className="text-muted-foreground">Final Interview Decision</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Scores */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Confidence', score: currentInterview.evaluation.confidenceScore, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Clarity', score: currentInterview.evaluation.clarityScore, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Technical', score: currentInterview.evaluation.technicalScore, color: 'from-orange-500 to-amber-500' },
                  ].map(({ label, score, color }) => (
                    <Card key={label} className="glass-card">
                      <CardContent className="p-6 text-center">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                          {Math.round(score)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{label}</p>
                        <Progress value={score} className="h-1.5 mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Reasoning */}
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3">Interviewer's Notes</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentInterview.evaluation.reasoning}
                    </p>
                  </CardContent>
                </Card>

                <Button onClick={resetInterview} size="lg" className="w-full">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Start New Interview
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
