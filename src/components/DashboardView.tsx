import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { CustomerGrowthChart, RevenueTrendsChart, TaskCompletionChart } from './Charts';
import { ReportStats, ActivityLog, Task } from '../types';

interface DashboardProps {
  stats: ReportStats | null;
  activityLogs: ActivityLog[];
  tasks: Task[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ stats, activityLogs, tasks, onNavigate }: DashboardProps) {
  if (!stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-slate-500 font-medium">Gathering back-office metrics...</p>
      </div>
    );
  }

  const kpis = stats.kpis;
  const leadConversionPct = kpis.totalLeads > 0 
    ? Math.round((kpis.convertedLeads / kpis.totalLeads) * 100) 
    : 0;

  // Fetch pending tasks sorted by closest deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.status === 'Pending' || t.status === 'In Progress')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Customers */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{kpis.totalCustomers}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{kpis.activeCustomers} Active</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{kpis.pendingTasks}</span>
              {kpis.overdueTasks > 0 && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{kpis.overdueTasks} Overdue</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lead Conversion</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{leadConversionPct}%</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{kpis.convertedLeads}/{kpis.totalLeads} Won</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MRR Projections</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">${kpis.estimatedRevenue.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Steady</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <CustomerGrowthChart data={stats.charts.customerGrowth} />
          <RevenueTrendsChart data={stats.charts.revenueTrends} />
        </div>
        <div className="lg:col-span-1">
          <TaskCompletionChart data={stats.charts.taskCompletion} />
        </div>
      </div>

      {/* Activity Logs & Upcomings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">Recent Operations Stream</h4>
            <button 
              onClick={() => onNavigate('activity-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Full Log History
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1">
            {activityLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recorded system entries.
              </div>
            ) : (
              activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start justify-between text-xs border-b border-slate-50/70 pb-2">
                  <div className="space-y-0.5 text-left">
                    <p className="font-semibold text-slate-700">{log.action}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Executed by <span className="text-slate-500 font-semibold">{log.userName}</span> in <span className="text-slate-500">{log.module}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                      log.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Task Deadlines */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h4>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Task Board
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
            {upcomingDeadlines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 stroke-1 mb-2" />
                <span>All caught up! No impending deadlines.</span>
              </div>
            ) : (
              upcomingDeadlines.map((task) => {
                const isOverdue = new Date(task.deadline) < new Date();
                return (
                  <div key={task.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2.5 text-left">
                    <div className="mt-0.5">
                      {isOverdue ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-700 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          task.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                          task.priority === 'High' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          Due: {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
