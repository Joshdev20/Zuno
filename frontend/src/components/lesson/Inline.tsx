import { Fragment, type ReactNode } from 'react';

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((part) => part !== '');
  const nodes: ReactNode[] = parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
  return <>{nodes}</>;
}
