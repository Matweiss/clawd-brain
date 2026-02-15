import { extractTasks } from '../../lib/data';
import { CheckSquare, Calendar, FileText } from 'lucide-react';

export default async function TasksPage() {
  const tasks = await extractTasks();

  // Group by date
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Action items extracted from your memories
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 
                      dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <CheckSquare className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Action Items
              </h2>
              <p className="text-sm text-gray-500">
                {tasks.length} tasks found across memories
              </p>
            </div>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckSquare className="mx-auto mb-4" size={48} />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm">Add TODO, FIXME, or Action: items to your memory files</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 
                              dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <Calendar size={16} />
                  {date === 'unknown' ? 'Unknown Date' : new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="space-y-2">
                  {grouped[date].map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg 
                               bg-gray-50 dark:bg-gray-800/50
                               hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 
                                   focus:ring-primary-500"
                          readOnly
                          checked={task.status === 'done'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white">
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="text-gray-400" size={14} />
                          <span className="text-xs text-gray-500 truncate">
                            {task.source}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full
                        ${task.status === 'done' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
