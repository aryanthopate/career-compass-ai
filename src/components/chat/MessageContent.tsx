import { CodeBlock } from './CodeBlock';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  // Parse markdown-style code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          if (match) {
            const [, language, code] = match;
            return <CodeBlock key={index} code={code.trim()} language={language} />;
          }
        }

        // Handle inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        
        return (
          <span key={index}>
            {inlineParts.map((inline, i) => {
              if (inline.startsWith('`') && inline.endsWith('`')) {
                return (
                  <code 
                    key={i} 
                    className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs"
                  >
                    {inline.slice(1, -1)}
                  </code>
                );
              }
              
              // Handle bold text
              const boldParts = inline.split(/(\*\*[^*]+\*\*)/g);
              return boldParts.map((bold, j) => {
                if (bold.startsWith('**') && bold.endsWith('**')) {
                  return <strong key={`${i}-${j}`}>{bold.slice(2, -2)}</strong>;
                }
                // Handle newlines
                return bold.split('\n').map((line, k, arr) => (
                  <span key={`${i}-${j}-${k}`}>
                    {line}
                    {k < arr.length - 1 && <br />}
                  </span>
                ));
              });
            })}
          </span>
        );
      })}
    </div>
  );
}
