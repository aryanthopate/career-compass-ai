import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChatStream, ChatMessage as ChatMessageType } from '@/lib/useChatStream';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Loader2,
  Bot,
  Search,
  Sparkles,
  Clock,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Zap,
  FileText,
  Target,
  Briefcase,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const quickPrompts = [
  { icon: FileText, text: 'Review my resume', prompt: 'Can you help me improve my resume? What are the key things I should focus on?' },
  { icon: Target, text: 'Skill recommendations', prompt: 'What skills should I learn to become a better software engineer in 2024?' },
  { icon: Briefcase, text: 'Interview tips', prompt: 'Give me the top 5 tips for acing a technical interview at a FAANG company.' },
  { icon: Zap, text: 'Career advice', prompt: 'I am a fresh graduate. What career path should I choose in tech?' },
];

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { messages, isLoading, error, sendMessage, clearMessages, setMessages } = useChatStream();

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
      setConversations(data || []);
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

    setConversations(prev => [data, ...prev]);
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
    
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      clearMessages();
    }
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

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

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
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} border-r border-border bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-4 space-y-4">
            <Button onClick={createNewConversation} className="w-full gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            {loadingConversations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No matches found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentConversationId === conv.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentConversationId === conv.id ? 'bg-primary/20' : 'bg-secondary'
                    }`}>
                      <MessageSquare className={`w-4 h-4 ${currentConversationId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(conv.updated_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-card border border-border rounded-r-lg shadow-sm hover:bg-secondary transition-colors"
          style={{ left: sidebarOpen ? '318px' : '0' }}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative">
          {currentConversationId || messages.length > 0 ? (
            <>
              <ScrollArea className="flex-1 p-6">
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
              </ScrollArea>
              
              <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm">
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
            <div className="flex-1 flex flex-col items-center justify-center p-8">
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
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
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
    </div>
  );
}
