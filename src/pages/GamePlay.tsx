import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  Star,
  Trophy,
  Zap,
  RotateCcw,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  Award,
  Lock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Game {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  instructions: string;
  code_template: string;
  expected_output: string;
  hints: string[];
  xp_reward: number;
  time_limit_seconds: number;
  order_index: number;
}

interface GameScore {
  game_id: string;
  completed: boolean;
  score: number;
  attempts: number;
}

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  advanced: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  expert: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
  master: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
};

const languageInfo: Record<string, { name: string; color: string; gradient: string }> = {
  html: { name: 'HTML', color: 'text-orange-500', gradient: 'from-orange-500 to-red-500' },
  css: { name: 'CSS', color: 'text-blue-500', gradient: 'from-blue-500 to-purple-500' },
  javascript: { name: 'JavaScript', color: 'text-yellow-500', gradient: 'from-yellow-500 to-amber-500' },
  typescript: { name: 'TypeScript', color: 'text-blue-600', gradient: 'from-blue-600 to-blue-400' },
  python: { name: 'Python', color: 'text-green-500', gradient: 'from-green-500 to-emerald-500' },
  rust: { name: 'Rust', color: 'text-rose-500', gradient: 'from-rose-500 to-red-600' },
};

export default function GamePlay() {
  const { language } = useParams<{ language: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [games, setGames] = useState<Game[]>([]);
  const [scores, setScores] = useState<Map<string, GameScore>>(new Map());
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [userCode, setUserCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const langInfo = languageInfo[language || ''] || { name: language, color: 'text-primary', gradient: 'from-primary to-accent' };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && language) {
      loadGames();
    }
  }, [user, language]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadGames = async () => {
    setLoading(true);
    
    const { data: gamesData } = await supabase
      .from('games')
      .select('*')
      .eq('language', language as any)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (gamesData) {
      setGames(gamesData as Game[]);
    }

    // Load user scores
    if (user) {
      const { data: scoresData } = await supabase
        .from('game_scores')
        .select('game_id, completed, score, attempts')
        .eq('user_id', user.id);

      if (scoresData) {
        const scoreMap = new Map(scoresData.map(s => [s.game_id, s]));
        setScores(scoreMap);
      }
    }

    setLoading(false);
  };

  const startGame = (game: Game) => {
    setCurrentGame(game);
    setUserCode(game.code_template);
    setTimeLeft(game.time_limit_seconds);
    setShowHint(false);
    setHintIndex(0);
    setResult(null);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    toast({ 
      title: "Time's up!", 
      description: 'Try again to complete the challenge.',
      variant: 'destructive' 
    });
    setCurrentGame(null);
  };

  const checkAnswer = async () => {
    if (!currentGame || !user) return;
    
    setChecking(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Simple check - normalize and compare
    const normalizeCode = (code: string) => 
      code.replace(/\s+/g, ' ').trim().toLowerCase();
    
    const userNormalized = normalizeCode(userCode);
    const expectedNormalized = normalizeCode(currentGame.expected_output);
    
    const isCorrect = userNormalized.includes(expectedNormalized) || 
                      expectedNormalized.includes(userNormalized) ||
                      userNormalized === expectedNormalized;

    const score = isCorrect ? currentGame.xp_reward : 0;
    const timeBonus = isCorrect ? Math.floor((timeLeft / currentGame.time_limit_seconds) * 10) : 0;
    const totalXP = score + timeBonus;

    // Save score
    const existingScore = scores.get(currentGame.id);
    
    if (existingScore) {
      await supabase
        .from('game_scores')
        .update({
          completed: isCorrect || existingScore.completed,
          score: Math.max(totalXP, existingScore.score),
          attempts: existingScore.attempts + 1,
          code_submitted: userCode,
        })
        .eq('user_id', user.id)
        .eq('game_id', currentGame.id);
    } else {
      await supabase
        .from('game_scores')
        .insert({
          user_id: user.id,
          game_id: currentGame.id,
          completed: isCorrect,
          score: totalXP,
          attempts: 1,
          code_submitted: userCode,
          time_taken_seconds: currentGame.time_limit_seconds - timeLeft,
        });
    }

    // Update user stats if correct
    if (isCorrect) {
      const { data: stats } = await supabase
        .from('user_game_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stats) {
        const levelKey = `${language}_level` as keyof typeof stats;
        const currentLevel = (stats[levelKey] as number) || 1;
        const newGamesCompleted = (!existingScore?.completed ? stats.games_completed + 1 : stats.games_completed);
        const newXP = stats.total_xp + totalXP;
        
        // Level up every 100 XP per language
        const newLevel = Math.floor(newXP / 100) + 1;

        await supabase
          .from('user_game_stats')
          .update({
            total_xp: newXP,
            games_completed: newGamesCompleted,
            [`${language}_level`]: Math.max(currentLevel, Math.min(newLevel, 10)),
            last_played_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    }

    setResult(isCorrect ? 'correct' : 'wrong');
    setEarnedXP(totalXP);
    setShowResultDialog(true);
    setChecking(false);
    loadGames(); // Refresh scores
  };

  const nextGame = () => {
    setShowResultDialog(false);
    const currentIndex = games.findIndex(g => g.id === currentGame?.id);
    if (currentIndex < games.length - 1) {
      startGame(games[currentIndex + 1]);
    } else {
      setCurrentGame(null);
      toast({ title: 'Congratulations!', description: 'You completed all games in this level!' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 px-4 max-w-6xl">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/games')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${langInfo.color}`}>{langInfo.name} Games</h1>
            <p className="text-muted-foreground text-sm">{games.length} challenges available</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentGame ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Game Header */}
              <Card className="glass-card overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${langInfo.gradient}`} />
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${difficultyColors[currentGame.difficulty]?.bg} ${difficultyColors[currentGame.difficulty]?.text} border ${difficultyColors[currentGame.difficulty]?.border}`}>
                          {currentGame.difficulty}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {currentGame.xp_reward} XP
                        </Badge>
                      </div>
                      <h2 className="text-xl font-bold">{currentGame.title}</h2>
                      <p className="text-muted-foreground">{currentGame.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-lg ${timeLeft < 30 ? 'bg-red-500/10 text-red-500' : 'bg-muted'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentGame(null)}>
                        Exit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="glass-card">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Your Mission</h3>
                      <p className="text-muted-foreground">{currentGame.instructions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Editor */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Code</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setUserCode(currentGame.code_template)}
                        className="gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </Button>
                      {currentGame.hints && currentGame.hints.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setShowHint(true);
                            setHintIndex(Math.min(hintIndex + 1, currentGame.hints.length - 1));
                          }}
                          className="gap-1"
                        >
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          Hint ({hintIndex + 1}/{currentGame.hints.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {showHint && currentGame.hints && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-center gap-2 text-yellow-500 text-sm">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium">Hint:</span>
                        <span>{currentGame.hints[hintIndex]}</span>
                      </div>
                    </div>
                  )}
                  
                  <Textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="font-mono text-sm min-h-[200px] bg-zinc-950 text-zinc-100 border-zinc-800"
                    placeholder="Write your code here..."
                  />
                  
                  <Button 
                    onClick={checkAnswer} 
                    disabled={checking}
                    className="w-full mt-4 gap-2"
                    size="lg"
                  >
                    {checking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Submit Answer
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Games List */}
              <div className="space-y-4">
                {['beginner', 'intermediate', 'advanced', 'expert', 'master'].map(difficulty => {
                  const diffGames = games.filter(g => g.difficulty === difficulty);
                  if (diffGames.length === 0) return null;
                  
                  return (
                    <div key={difficulty}>
                      <h3 className={`text-lg font-semibold mb-3 capitalize ${difficultyColors[difficulty]?.text}`}>
                        {difficulty} Level
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {diffGames.map((game, index) => {
                          const score = scores.get(game.id);
                          const isCompleted = score?.completed;
                          const prevGame = diffGames[index - 1];
                          const prevCompleted = prevGame ? scores.get(prevGame.id)?.completed : true;
                          const isLocked = index > 0 && !prevCompleted && !isCompleted;
                          
                          return (
                            <Card 
                              key={game.id}
                              className={`glass-card transition-all ${isLocked ? 'opacity-50' : 'hover:border-primary/50 cursor-pointer'}`}
                              onClick={() => !isLocked && startGame(game)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    isCompleted ? 'bg-green-500/10' : 
                                    isLocked ? 'bg-muted' :
                                    `bg-gradient-to-br ${langInfo.gradient} bg-opacity-20`
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : isLocked ? (
                                      <Lock className="w-6 h-6 text-muted-foreground" />
                                    ) : (
                                      <span className="text-lg font-bold text-white">{index + 1}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{game.title}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{game.description}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className="gap-1">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      {game.xp_reward}
                                    </Badge>
                                    {score && (
                                      <span className="text-xs text-muted-foreground">
                                        {score.attempts} attempt{score.attempts > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Dialog */}
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle className="flex flex-col items-center gap-4">
                {result === 'correct' ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-green-500" />
                    </div>
                    <span className="text-2xl">Excellent! 🎉</span>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <span className="text-2xl">Not quite right</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {result === 'correct' ? (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-center gap-2">
                      <Badge className="text-lg px-4 py-2 bg-primary text-primary-foreground">
                        <Zap className="w-4 h-4 mr-2" />
                        +{earnedXP} XP
                      </Badge>
                    </div>
                    <p>You completed the challenge successfully!</p>
                  </div>
                ) : (
                  <p className="pt-4">Don't worry, you can try again. Check your code and give it another shot!</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              {result === 'correct' ? (
                <Button onClick={nextGame} className="w-full gap-2">
                  Next Challenge
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowResultDialog(false)} className="w-full">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => { setShowResultDialog(false); setCurrentGame(null); }} className="w-full">
                    Back to Games
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}