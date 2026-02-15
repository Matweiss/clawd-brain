'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} className={className}>
      {children}
    </ReactMarkdown>
  );
}
