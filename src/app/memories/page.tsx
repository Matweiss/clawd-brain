import { getAllMemories } from '../../lib/data';
import Link from 'next/link';
import { Calendar, FileText } from 'lucide-react';

export default async function MemoriesPage() {
  const memories = await getAllMemories();

  // Group by month
  const grouped = memories.reduce((acc, memory) => {
    const month = memory.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(memory);
    return acc;
  }, {} as Record<string, typeof memories>);

  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Memories
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse your daily memory logs
        </p>
      </div>

      <div className="space-y-8">
        {sortedMonths.map((month) => (
          <div key={month} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 
                          border-b border-gray-200 dark:border-gray-800 pb-2">
              {new Date(month + '-01').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </h2>
            
            <div className="grid gap-3">
              {grouped[month].map((memory) => (
                <Link
                  key={memory.date}
                  href={`/memories/${memory.date}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 
                           rounded-lg border border-gray-200 dark:border-gray-800
                           hover:border-primary-500 dark:hover:border-primary-500
                           transition-colors group"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className="text-gray-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {new Date(memory.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {memory.preview}
                    </p>
                  </div>
                  <Calendar className="text-gray-400 group-hover:text-primary-500" size={20} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
