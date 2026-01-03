import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChatStream } from '@/lib/useChatStream';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Loader2,
  Bot,
  Search,
  Sparkles,
  Clock,
  PanelLeftClose,
  PanelLeft,
  Zap,
  FileText,
  Target,
  Briefcase,
  MoreHorizontal,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Edit3,
  Settings,
  Keyboard,
  HelpCircle,
  Star,
  Trash,
  Check,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  pinned?: boolean;
  archived?: boolean;
}

const quickPrompts = [
  { icon: FileText, text: 'Review my resume', prompt: 'Can you help me improve my resume? What are the key things I should focus on?', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Target, text: 'Skill recommendations', prompt: 'What skills should I learn to become a better software engineer in 2024?', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Briefcase, text: 'Interview tips', prompt: 'Give me the top 5 tips for acing a technical interview at a FAANG company.', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { icon: Zap, text: 'Career advice', prompt: 'I am a fresh graduate. What career path should I choose in tech?', color: 'text-violet-500', bg: 'bg-violet-500/10' },
];

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const { messages, isLoading, error, sendMessage, clearMessages, setMessages } = useChatStream();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewConversation();
      }
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Ctrl/Cmd + /: Toggle shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      }
      // Ctrl/Cmd + B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setSettingsOpen(false);
        setShortcutsOpen(false);
        setDeleteConfirmId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [error]);

  useEffect(() => {
    if (currentConversationId && messages.length > 0 && !isLoading) {
      saveMessages();
    }
  }, [messages, isLoading]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
    } else {
      // Add pinned/archived state (stored locally for now)
      const stored = localStorage.getItem('chat_meta') || '{}';
      const meta = JSON.parse(stored);
      const enhanced = (data || []).map(c => ({
        ...c,
        pinned: meta[c.id]?.pinned || false,
        archived: meta[c.id]?.archived || false,
      }));
      setConversations(enhanced);
    }
    setLoadingConversations(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data?.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) || []);
  };

  const saveMessages = async () => {
    if (!currentConversationId || !user) return;

    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', currentConversationId);

    const messagesToInsert = messages.map(m => ({
      conversation_id: currentConversationId,
      user_id: user.id,
      role: m.role,
      content: m.content,
    }));

    if (messagesToInsert.length > 0) {
      await supabase.from('chat_messages').insert(messagesToInsert);
    }

    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
      await supabase
        .from('chat_conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
      
      setConversations(prev => 
        prev.map(c => c.id === currentConversationId ? { ...c, title } : c)
      );
    }
  };

  const updateMeta = (id: string, updates: { pinned?: boolean; archived?: boolean }) => {
    const stored = localStorage.getItem('chat_meta') || '{}';
    const meta = JSON.parse(stored);
    meta[id] = { ...(meta[id] || {}), ...updates };
    localStorage.setItem('chat_meta', JSON.stringify(meta));
    
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setConversations(prev => [{ ...data, pinned: false, archived: false }, ...prev]);
    setCurrentConversationId(data.id);
    clearMessages();
    return data.id;
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
    loadMessages(id);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmId(null);
    
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      clearMessages();
    }
    toast({ title: 'Deleted', description: 'Conversation removed.' });
  };

  const renameConversation = async (id: string, newTitle: string) => {
    await supabase
      .from('chat_conversations')
      .update({ title: newTitle })
      .eq('id', id);
    
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    setEditingId(null);
    toast({ title: 'Renamed', description: 'Conversation renamed.' });
  };

  const handleSendMessage = async (input: string) => {
    if (!currentConversationId) {
      await createNewConversation();
    }
    sendMessage(input);
  };

  const handleQuickPrompt = async (prompt: string) => {
    const convId = currentConversationId || await createNewConversation();
    if (convId) {
      sendMessage(prompt);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  // Filter and sort conversations
  const pinnedConvs = conversations.filter(c => c.pinned && !c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const regularConvs = conversations.filter(c => !c.pinned && !c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const archivedConvs = conversations.filter(c => c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300 overflow-hidden h-[calc(100vh-4rem)]`}>
          {/* Sidebar Header */}
          <div className="p-4 space-y-3 border-b border-border flex-shrink-0">
            <Button onClick={createNewConversation} className="w-full gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-1">
              <Button
                variant={!showArchived ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowArchived(false)}
                className="flex-1 text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Chats
              </Button>
              <Button
                variant={showArchived ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowArchived(true)}
                className="flex-1 text-xs"
              >
                <Archive className="w-3.5 h-3.5 mr-1.5" />
                Archived
              </Button>
            </div>
          </div>
          
          {/* Scrollable Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {loadingConversations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : showArchived ? (
              archivedConvs.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No archived chats</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {archivedConvs.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={currentConversationId === conv.id}
                      onSelect={() => selectConversation(conv.id)}
                      onPin={() => updateMeta(conv.id, { pinned: !conv.pinned })}
                      onArchive={() => updateMeta(conv.id, { archived: false })}
                      onDelete={() => setDeleteConfirmId(conv.id)}
                      onEdit={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                      formatTime={formatTime}
                      isEditing={editingId === conv.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSaveEdit={() => renameConversation(conv.id, editTitle)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>
              )
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedConvs.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </div>
                    <div className="space-y-1">
                      {pinnedConvs.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conv={conv}
                          isActive={currentConversationId === conv.id}
                          onSelect={() => selectConversation(conv.id)}
                          onPin={() => updateMeta(conv.id, { pinned: false })}
                          onArchive={() => updateMeta(conv.id, { archived: true })}
                          onDelete={() => setDeleteConfirmId(conv.id)}
                          onEdit={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                          formatTime={formatTime}
                          isEditing={editingId === conv.id}
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          onSaveEdit={() => renameConversation(conv.id, editTitle)}
                          onCancelEdit={() => setEditingId(null)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Chats */}
                {regularConvs.length === 0 && pinnedConvs.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No matches found' : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {regularConvs.length > 0 && pinnedConvs.length > 0 && (
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Recent
                      </div>
                    )}
                    {regularConvs.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={currentConversationId === conv.id}
                        onSelect={() => selectConversation(conv.id)}
                        onPin={() => updateMeta(conv.id, { pinned: true })}
                        onArchive={() => updateMeta(conv.id, { archived: true })}
                        onDelete={() => setDeleteConfirmId(conv.id)}
                        onEdit={() => { setEditingId(conv.id); setEditTitle(conv.title); }}
                        formatTime={formatTime}
                        isEditing={editingId === conv.id}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSaveEdit={() => renameConversation(conv.id, editTitle)}
                        onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border flex-shrink-0 space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground" onClick={() => setSettingsOpen(true)}>
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground" onClick={() => setShortcutsOpen(true)}>
              <span className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Shortcuts
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">Ctrl+/</kbd>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              Help & FAQ
            </Button>
          </div>
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-4 z-20 p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-secondary transition-all ${sidebarOpen ? 'left-[308px]' : 'left-2'}`}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)]">
          {currentConversationId || messages.length > 0 ? (
            <>
              {/* Messages with separate scroll */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-2xl rounded-tl-md shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Input fixed at bottom */}
              <div className="flex-shrink-0 border-t border-border p-4 bg-background/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                  <ChatInput 
                    onSend={handleSendMessage} 
                    isLoading={isLoading}
                    placeholder="Ask about careers, resumes, interviews, skills..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
              <div className="max-w-2xl w-full text-center">
                {/* Hero */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50" />
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3">Career AI Assistant</h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      Your personal AI career coach. Ask anything about resumes, interviews, skills, or career paths.
                    </p>
                  </div>
                </div>
                
                {/* Quick Prompts */}
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {quickPrompts.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(item.prompt)}
                        className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Start Button */}
                <Button onClick={createNewConversation} size="lg" className="gap-2 shadow-lg">
                  <Plus className="w-5 h-5" />
                  Start a New Chat
                </Button>
                
                <p className="text-sm text-muted-foreground mt-6">
                  Your conversations are saved automatically
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="w-5 h-5 text-destructive" />
              Delete Conversation?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteConversation(deleteConfirmId)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Chat Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save conversations</p>
                <p className="text-sm text-muted-foreground">Save chats automatically</p>
              </div>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Model</p>
                <p className="text-sm text-muted-foreground">Current model in use</p>
              </div>
              <Badge variant="outline">Gemini Pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conversation history</p>
                <p className="text-sm text-muted-foreground">Total saved chats</p>
              </div>
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shortcuts Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Quick actions to speed up your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { keys: ['Ctrl', 'N'], action: 'New conversation', icon: Plus },
              { keys: ['Ctrl', 'K'], action: 'Search conversations', icon: Search },
              { keys: ['Ctrl', 'B'], action: 'Toggle sidebar', icon: PanelLeft },
              { keys: ['Ctrl', '/'], action: 'Show shortcuts', icon: Keyboard },
              { keys: ['Esc'], action: 'Close dialogs', icon: X },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <shortcut.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{shortcut.action}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <span key={j}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
                        {key}
                      </kbd>
                      {j < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShortcutsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Conversation Item Component
function ConversationItem({
  conv,
  isActive,
  onSelect,
  onPin,
  onArchive,
  onDelete,
  onEdit,
  formatTime,
  isEditing,
  editTitle,
  setEditTitle,
  onSaveEdit,
  onCancelEdit,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onEdit: () => void;
  formatTime: (d: string) => string;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 border border-primary/20' 
          : 'hover:bg-secondary/50 border border-transparent'
      }`}
      onClick={() => !isEditing && onSelect()}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isActive ? 'bg-primary/20' : 'bg-secondary'
      }`}>
        {conv.pinned ? (
          <Star className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-yellow-500'}`} />
        ) : (
          <MessageSquare className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onSaveEdit}>
              <Check className="w-3.5 h-3.5 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onCancelEdit}>
              <X className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium truncate">{conv.title}</p>
            <p className="text-xs text-muted-foreground">{formatTime(conv.updated_at)}</p>
          </>
        )}
      </div>

      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(); }}>
              {conv.pinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
              {conv.pinned ? 'Unpin' : 'Pin to top'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              {conv.archived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
              {conv.archived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
