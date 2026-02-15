import { listMarkdownFiles, getFileContent } from '../../lib/data';
import Link from 'next/link';
import { FileText, Folder, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function DocumentsPage() {
  const files = await listMarkdownFiles();
  
  // Group by directory
  const grouped = files.reduce((acc, file) => {
    const dir = file.path.split('/')[0] || 'root';
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  const sortedDirs = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Documents
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse all your knowledge files
        </p>
      </div>

      <div className="space-y-8">
        {sortedDirs.map((dir) => (
          <div key={dir} className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 
                          dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 pb-2">
              <Folder className="text-primary-500" size={20} />
              {dir === 'root' ? 'Root Directory' : dir}
              <span className="text-sm font-normal text-gray-500">
                ({grouped[dir].length} files)
              </span>
            </div>
            
            <div className="grid gap-2">
              {grouped[dir].map((file) => (
                <DocumentItem key={file.path} file={file} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function DocumentItem({ file }: { file: { name: string; path: string; size: number; mtime: Date; type: string } }) {
  const content = await getFileContent(file.path);
  const preview = content.substring(0, 200);

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 
                    dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="text-gray-400 mt-1" size={20} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {file.path} • {formatBytes(file.size)} • {file.mtime.toLocaleDateString()}
            </p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {preview}...
            </div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-gray-400" size={20} />
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
