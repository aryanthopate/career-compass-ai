import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { MessageContent } from './MessageContent';
import type { ChatMessage as ChatMessageType } from '@/lib/useChatStream';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-primary to-primary/80' 
          : 'bg-gradient-to-br from-accent to-accent/80'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-accent-foreground" />
        )}
      </div>
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`relative inline-block px-5 py-4 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-md' 
            : 'bg-card border border-border rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MessageContent content={message.content} />
          )}
          
          {/* Copy button for assistant messages */}
          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="absolute -right-10 top-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4 text-score-good" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
