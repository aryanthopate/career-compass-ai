import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Gamepad2,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Star,
  Globe,
  Palette,
  Zap,
  Code,
  FileCode,
  Target,
  RefreshCw,
  Eye,
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
  is_active: boolean;
  order_index: number;
}

const languageIcons: Record<string, any> = {
  html: Globe,
  css: Palette,
  javascript: Zap,
  typescript: Code,
  python: FileCode,
  rust: Target,
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-500 bg-green-500/10',
  intermediate: 'text-blue-500 bg-blue-500/10',
  advanced: 'text-orange-500 bg-orange-500/10',
  expert: 'text-red-500 bg-red-500/10',
  master: 'text-purple-500 bg-purple-500/10',
};

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    difficulty: 'beginner',
    instructions: '',
    code_template: '',
    expected_output: '',
    hints: '',
    xp_reward: 10,
    time_limit_seconds: 120,
    is_active: true,
    order_index: 0,
  });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('language')
      .order('order_index');

    if (error) {
      console.error('Error loading games:', error);
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      description: '',
      language: 'javascript',
      difficulty: 'beginner',
      instructions: '',
      code_template: '',
      expected_output: '',
      hints: '',
      xp_reward: 10,
      time_limit_seconds: 120,
      is_active: true,
      order_index: games.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description || '',
      language: game.language,
      difficulty: game.difficulty,
      instructions: game.instructions || '',
      code_template: game.code_template || '',
      expected_output: game.expected_output || '',
      hints: game.hints?.join('\n') || '',
      xp_reward: game.xp_reward,
      time_limit_seconds: game.time_limit_seconds || 120,
      is_active: game.is_active,
      order_index: game.order_index,
    });
    setDialogOpen(true);
  };

  const saveGame = async () => {
    setSaving(true);

    const gameData = {
      title: formData.title,
      description: formData.description,
      language: formData.language as any,
      difficulty: formData.difficulty as any,
      instructions: formData.instructions,
      code_template: formData.code_template,
      expected_output: formData.expected_output,
      hints: formData.hints.split('\n').filter(h => h.trim()),
      xp_reward: formData.xp_reward,
      time_limit_seconds: formData.time_limit_seconds,
      is_active: formData.is_active,
      order_index: formData.order_index,
    };

    if (editingGame) {
      const { error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', editingGame.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Game updated successfully' });
        setDialogOpen(false);
        loadGames();
      }
    } else {
      const { error } = await supabase
        .from('games')
        .insert(gameData);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Game created successfully' });
        setDialogOpen(false);
        loadGames();
      }
    }

    setSaving(false);
  };

  const deleteGame = async (id: string) => {
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Game removed' });
      loadGames();
    }
  };

  const toggleActive = async (game: Game) => {
    const { error } = await supabase
      .from('games')
      .update({ is_active: !game.is_active })
      .eq('id', game.id);

    if (!error) {
      loadGames();
    }
  };

  const filteredGames = filterLanguage === 'all' 
    ? games 
    : games.filter(g => g.language === filterLanguage);

  const stats = {
    total: games.length,
    active: games.filter(g => g.is_active).length,
    byLanguage: Object.entries(
      games.reduce((acc, g) => {
        acc[g.language] = (acc[g.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            Game Management
          </h1>
          <p className="text-muted-foreground">Create and manage coding games</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadGames} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Game
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        {stats.byLanguage.slice(0, 2).map(([lang, count]) => {
          const Icon = languageIcons[lang] || Code;
          return (
            <Card key={lang} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{lang}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Language:</Label>
        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Games Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => {
                    const Icon = languageIcons[game.language] || Code;
                    return (
                      <TableRow key={game.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{game.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {game.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="capitalize">{game.language}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={difficultyColors[game.difficulty]}>
                            {game.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {game.xp_reward}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={game.is_active}
                            onCheckedChange={() => toggleActive(game)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(game)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGame(game.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? 'Edit Game' : 'Create New Game'}
            </DialogTitle>
            <DialogDescription>
              {editingGame ? 'Update game details' : 'Add a new coding challenge'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Game title"
                />
              </div>
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData(p => ({ ...p, xp_reward: +e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(v) => setFormData(p => ({ ...p, language: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => setFormData(p => ({ ...p, difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time (seconds)</Label>
                <Input
                  type="number"
                  value={formData.time_limit_seconds}
                  onChange={(e) => setFormData(p => ({ ...p, time_limit_seconds: +e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData(p => ({ ...p, instructions: e.target.value }))}
                placeholder="What the player needs to do"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Code Template</Label>
              <Textarea
                value={formData.code_template}
                onChange={(e) => setFormData(p => ({ ...p, code_template: e.target.value }))}
                placeholder="Starting code"
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Output</Label>
              <Textarea
                value={formData.expected_output}
                onChange={(e) => setFormData(p => ({ ...p, expected_output: e.target.value }))}
                placeholder="Correct answer"
                className="font-mono text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Hints (one per line)</Label>
              <Textarea
                value={formData.hints}
                onChange={(e) => setFormData(p => ({ ...p, hints: e.target.value }))}
                placeholder="Hint 1&#10;Hint 2"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGame} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingGame ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}