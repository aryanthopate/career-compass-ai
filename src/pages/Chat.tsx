import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStream, ChatMessage as ChatMessageType } from '@/lib/useChatStream';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Loader2,
  Bot 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  
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

  // Auto-save messages when they change
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

    // Delete existing messages
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', currentConversationId);

    // Insert new messages
    const messagesToInsert = messages.map(m => ({
      conversation_id: currentConversationId,
      user_id: user.id,
      role: m.role,
      content: m.content,
    }));

    if (messagesToInsert.length > 0) {
      await supabase.from('chat_messages').insert(messagesToInsert);
    }

    // Update conversation title from first user message
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
        <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4">
            <Button onClick={createNewConversation} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            {loadingConversations ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1 pb-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conv.id 
                        ? 'bg-secondary' 
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {currentConversationId || messages.length > 0 ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <Bot className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-2xl rounded-bl-md">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="border-t border-border p-4 bg-background">
                <div className="max-w-3xl mx-auto">
                  <ChatInput 
                    onSend={handleSendMessage} 
                    isLoading={isLoading}
                    placeholder="Ask me anything about careers, resumes, interviews..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Career AI Assistant</h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Get expert advice on resumes, interviews, career paths, and professional development.
              </p>
              <Button onClick={createNewConversation} size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                Start a Conversation
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
