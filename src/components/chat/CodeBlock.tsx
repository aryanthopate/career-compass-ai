import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Terminal, FileCode, Braces, Hash, Database, Cog, FileJson, Globe, Palette } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const languageColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  javascript: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Braces },
  js: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Braces },
  typescript: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Braces },
  ts: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Braces },
  jsx: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: Braces },
  tsx: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', icon: Braces },
  python: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', icon: FileCode },
  py: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', icon: FileCode },
  bash: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Terminal },
  shell: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Terminal },
  sh: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Terminal },
  zsh: { bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30', icon: Terminal },
  sql: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', icon: Database },
  json: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', icon: FileJson },
  html: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', icon: Globe },
  css: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', icon: Palette },
  scss: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', icon: Palette },
  sass: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', icon: Palette },
  less: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', icon: Palette },
  java: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: FileCode },
  kotlin: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', icon: FileCode },
  swift: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', icon: FileCode },
  go: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', icon: FileCode },
  rust: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', icon: Cog },
  c: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', icon: FileCode },
  cpp: { bg: 'bg-blue-600/15', text: 'text-blue-300', border: 'border-blue-600/30', icon: FileCode },
  csharp: { bg: 'bg-green-600/15', text: 'text-green-300', border: 'border-green-600/30', icon: FileCode },
  php: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', icon: FileCode },
  ruby: { bg: 'bg-red-600/15', text: 'text-red-400', border: 'border-red-600/30', icon: FileCode },
  yaml: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: FileCode },
  yml: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: FileCode },
  xml: { bg: 'bg-cyan-600/15', text: 'text-cyan-400', border: 'border-cyan-600/30', icon: FileCode },
  markdown: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', icon: FileCode },
  md: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', icon: FileCode },
  graphql: { bg: 'bg-pink-600/15', text: 'text-pink-400', border: 'border-pink-600/30', icon: Hash },
  docker: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Cog },
  dockerfile: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Cog },
  default: { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30', icon: FileCode },
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

  // Enhanced syntax highlighting with more colors
  const highlightCode = (code: string) => {
    // Escape HTML first
    let result = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply highlighting in order (more specific patterns first)
    
    // Comments (single-line and multi-line)
    result = result.replace(/(\/\/.*$)/gm, '<span class="text-zinc-500 italic">$1</span>');
    result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>');
    result = result.replace(/(#.*$)/gm, '<span class="text-zinc-500 italic">$1</span>');
    
    // Strings (handle various quote types)
    result = result.replace(/(&quot;|"|')(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="text-emerald-400">$&</span>');
    result = result.replace(/(`[^`]*`)/g, '<span class="text-teal-400">$1</span>');
    
    // Keywords (expanded list)
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|class|extends|async|await|try|catch|throw|finally|new|this|super|static|get|set|typeof|instanceof|in|of|true|false|null|undefined|void|yield|delete|interface|type|enum|implements|private|public|protected|readonly|abstract|as|is|keyof|never|unknown|any|boolean|string|number|bigint|symbol|object|def|lambda|self|None|True|False|elif|except|raise|with|pass|assert|global|nonlocal|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|INTO|VALUES|SET|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|ASC|DESC|DISTINCT|UNION|ALL|AS|INDEX|TABLE|DATABASE|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|CHECK|UNIQUE|DEFAULT|AUTO_INCREMENT|CASCADE)\b/g;
    result = result.replace(keywords, '<span class="text-purple-400 font-medium">$1</span>');
    
    // Built-in functions and methods
    const builtins = /\b(console|window|document|Array|Object|String|Number|Boolean|Promise|Map|Set|Date|Math|JSON|RegExp|Error|Symbol|Proxy|Reflect|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|fetch|setTimeout|setInterval|clearTimeout|clearInterval|require|module|exports|print|len|range|list|dict|tuple|set|str|int|float|bool|type|input|open|file|dir|help|sum|min|max|abs|round|sorted|reversed|enumerate|zip|map|filter|reduce)\b/g;
    result = result.replace(builtins, '<span class="text-cyan-400">$1</span>');
    
    // Numbers (including hex, binary, octal)
    result = result.replace(/\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="text-orange-400">$1</span>');
    
    // Function calls
    result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="text-blue-400">$1</span>(');
    
    // Decorators and annotations
    result = result.replace(/(@[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="text-yellow-400">$1</span>');
    
    // Operators
    result = result.replace(/([=!<>]=?|[+\-*/%]|&amp;&amp;|\|\||[&|^~]|&lt;&lt;|&gt;&gt;)/g, '<span class="text-rose-400">$1</span>');
    
    // Property access
    result = result.replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '.<span class="text-sky-300">$1</span>');
    
    // JSX/HTML tags
    result = result.replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span class="text-red-400">$1</span>');
    
    // Class names (PascalCase)
    result = result.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="text-amber-300">$1</span>');

    return result;
  };

  return (
    <div className={`relative group my-4 rounded-xl overflow-hidden border ${langStyle.border} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${langStyle.bg} border ${langStyle.border}`}>
            <LangIcon className={`w-3.5 h-3.5 ${langStyle.text}`} />
            <span className={`text-xs font-mono font-semibold ${langStyle.text} uppercase tracking-wide`}>
              {language}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={`h-8 px-3 gap-2 text-xs font-medium transition-all ${
            copied 
              ? 'text-green-400 bg-green-500/15 border border-green-500/30' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code */}
      <div className="bg-zinc-950 overflow-x-auto">
        <pre className="p-4 overflow-x-auto">
          <code 
            className="text-sm font-mono leading-relaxed block"
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </pre>
      </div>
      
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none opacity-50" />
    </div>
  );
}