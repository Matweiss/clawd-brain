import { getStats, getDailyMemories, extractTasks } from '../lib/data';
import Link from 'next/link';
import { 
  FileText, 
  Calendar, 
  CheckSquare, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default async function Dashboard() {
  const [stats, memories, tasks] = await Promise.all([
    getStats(),
    getDailyMemories(5),
    extractTasks()
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your personal knowledge center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Memories" 
          value={stats.memories} 
          icon={FileText}
          href="/memories"
          color="blue"
        />
        <StatCard 
          title="Documents" 
          value={stats.documents} 
          icon={FileText}
          href="/documents"
          color="green"
        />
        <StatCard 
          title="Tasks" 
          value={tasks.length} 
          icon={CheckSquare}
          href="/tasks"
          color="purple"
        />
        <StatCard 
          title="Last Updated" 
          value={new Date(stats.lastUpdated).toLocaleTimeString()} 
          icon={Clock}
          href="#"
          color="orange"
          isTime
        />
      </div>

      {/* Recent Memories */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Memories
          </h2>
          <Link 
            href="/memories" 
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
          >
 View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="space-y-4">
          {memories.map((memory) => (
            <Link 
              key={memory.date}
              href={`/memories/${memory.date}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 
                         hover:border-primary-500 dark:hover:border-primary-500 
                         transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600">
                    {memory.date}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {memory.preview}
                  </p>
                </div>
                <Calendar className="text-gray-400" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction href="/search" label="Search Memories" />
          <QuickAction href="/timeline" label="View Timeline" />
          <QuickAction href="/tasks" label={`View Tasks (${tasks.length})`} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  href, 
  color,
  isTime 
}: { 
  title: string; 
  value: string | number; 
  icon: typeof FileText; 
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isTime?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'
  };

  return (
    <Link 
      href={href}
      className="block p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 
                 dark:border-gray-800 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${isTime ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 
                 dark:text-primary-300 rounded-lg hover:bg-primary-100 
                 dark:hover:bg-primary-900/30 transition-colors"
    >
      {label}
    </Link>
  );
}
