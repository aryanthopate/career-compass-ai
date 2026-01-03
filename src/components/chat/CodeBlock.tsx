import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Terminal, FileCode, Braces, Hash } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const languageColors: Record<string, { bg: string; text: string; icon: any }> = {
  javascript: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Braces },
  typescript: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Braces },
  jsx: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: Braces },
  tsx: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Braces },
  python: { bg: 'bg-green-500/20', text: 'text-green-400', icon: FileCode },
  bash: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Terminal },
  shell: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Terminal },
  sql: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: Hash },
  json: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Braces },
  html: { bg: 'bg-red-500/20', text: 'text-red-400', icon: FileCode },
  css: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: FileCode },
  default: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: FileCode },
};

export function CodeBlock({ code, language = 'code' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const langKey = language.toLowerCase();
  const langStyle = languageColors[langKey] || languageColors.default;
  const LangIcon = langStyle.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    // Keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|async|await|try|catch|throw|new|this|super|static|get|set|typeof|instanceof|in|of|true|false|null|undefined|void)\b/g;
    // Strings
    const strings = /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g;
    // Numbers
    const numbers = /\b(\d+\.?\d*)\b/g;
    // Comments
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    // Functions
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;

    let result = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    result = result
      .replace(comments, '<span class="text-zinc-500 italic">$1</span>')
      .replace(strings, '<span class="text-emerald-400">$&</span>')
      .replace(keywords, '<span class="text-purple-400 font-medium">$1</span>')
      .replace(numbers, '<span class="text-orange-400">$1</span>')
      .replace(functions, '<span class="text-blue-400">$1</span>(');

    return result;
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${langStyle.bg}`}>
            <LangIcon className={`w-3.5 h-3.5 ${langStyle.text}`} />
            <span className={`text-xs font-mono font-medium ${langStyle.text}`}>
              {language}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={`h-7 px-3 gap-1.5 text-xs transition-all ${
            copied 
              ? 'text-green-400 bg-green-500/10' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code */}
      <div className="bg-zinc-950 overflow-x-auto">
        <pre className="p-4">
          <code 
            className="text-sm font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </pre>
      </div>
    </div>
  );
}
