import { getFileContent } from '../../../lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemoryDetailPage({ params }: Props) {
  const { id } = await params;
  const filePath = `memory/${id}.md`;
  
  let content: string;
  try {
    content = await getFileContent(filePath);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/memories"
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 
                   dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Date(id).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <Calendar size={16} />
            Daily Memory Log
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 
                      dark:border-gray-800 p-6 md:p-8">
        <div className="markdown prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
