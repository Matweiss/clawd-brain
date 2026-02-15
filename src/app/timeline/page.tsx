import { getAllMemories } from '../../lib/data';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';

export default async function TimelinePage() {
  const memories = await getAllMemories();

  // Group by year and month
  const grouped = memories.reduce((acc, memory) => {
    const year = memory.date.substring(0, 4);
    const month = memory.date.substring(5, 7);
    const key = `${year}-${month}`;
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(memory);
    
    return acc;
  }, {} as Record<string, Record<string, typeof memories>>);

  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Timeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chronological view of your memories
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />

        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* Year marker */}
              <div className="sticky top-0 z-10 flex items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-950 py-2">
                <div className="w-8 md:w-16 flex justify-center">
                  <span className="text-xl font-bold text-primary-600">{year}</span>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(grouped[year])
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, monthMemories]) => (
                    <div key={month} className="relative">
                      {/* Month marker */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-8 md:w-16 flex justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {new Date(year + '-' + month + '-01').toLocaleDateString('en-US', {
                            month: 'long'
                          })}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({monthMemories.length} entries)
                        </span>
                      </div>

                      {/* Entries */}
                      <div className="ml-8 md:ml-16 space-y-2">
                        {monthMemories.map((memory) => (
                          <Link
                            key={memory.date}
                            href={`/memories/${memory.date}`}
                            className="flex items-center gap-3 p-3 rounded-lg 
                                     hover:bg-white dark:hover:bg-gray-900
                                     border border-transparent hover:border-gray-200
                                     dark:hover:border-gray-800 transition-all group"
                          >
                            <Calendar className="text-gray-400 group-hover:text-primary-500" size={16} />
                            <span className="text-sm text-gray-500 w-20">
                              {new Date(memory.date).toLocaleDateString('en-US', {
                                day: 'numeric'
                              })}
                            </span>
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-1 flex-1">
                              {memory.preview.substring(0, 100)}...
                            </p>
                            <ChevronRight className="text-gray-300 group-hover:text-primary-500" size={16} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
