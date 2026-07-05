import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  MessageSquare, 
  Paperclip, 
  Trash2, 
  Clock, 
  User, 
  ArrowRight
} from 'lucide-react';
import { Task, Employee, Customer, TaskComment } from '../types';

interface TaskViewProps {
  tasks: Task[];
  employees: Employee[];
  customers: Customer[];
  onCreateTask: (taskData: any) => Promise<void>;
  onUpdateTask: (id: string, updates: any) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAddTaskComment: (id: string, content: string) => Promise<void>;
}

export default function TaskView({
  tasks,
  employees,
  customers,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onAddTaskComment
}: TaskViewProps) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);

  // New task form
  const [formTask, setFormTask] = useState({
    title: '',
    description: '',
    assignedEmployeeId: 'usr-3',
    priority: 'Medium' as Task['priority'],
    deadline: '',
    customerId: ''
  });

  const [commentInput, setCommentInput] = useState('');

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        t.description.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  // Kanban column definitions
  const columns: Array<{ id: Task['status']; title: string; color: string }> = [
    { id: 'Pending', title: 'Pending Logs', color: 'border-amber-500 bg-amber-500/10 text-amber-800' },
    { id: 'In Progress', title: 'In Progress', color: 'border-blue-500 bg-blue-500/10 text-blue-800' },
    { id: 'Completed', title: 'Completed', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-800' },
    { id: 'Overdue', title: 'Overdue/Overrun', color: 'border-red-500 bg-red-500/10 text-red-850' }
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTask.title) return;
    await onCreateTask(formTask);
    setShowAddModal(false);
    setFormTask({
      title: '',
      description: '',
      assignedEmployeeId: 'usr-3',
      priority: 'Medium',
      deadline: '',
      customerId: ''
    });
  };

  const handleUpdateStatus = async (taskId: string, currentStatus: Task['status'], direction: 'next' | 'prev') => {
    const statusOrder: Task['status'][] = ['Pending', 'In Progress', 'Completed'];
    const idx = statusOrder.indexOf(currentStatus);
    if (idx === -1) return;

    let nextStatus: Task['status'] = currentStatus;
    if (direction === 'next' && idx < statusOrder.length - 1) {
      nextStatus = statusOrder[idx + 1];
    } else if (direction === 'prev' && idx > 0) {
      nextStatus = statusOrder[idx - 1];
    }

    if (nextStatus !== currentStatus) {
      await onUpdateTask(taskId, { status: nextStatus });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTaskForComments) return;
    await onAddTaskComment(selectedTaskForComments.id, commentInput);
    
    // update state in modal
    const updated = tasks.find(t => t.id === selectedTaskForComments.id);
    if (updated) {
      setSelectedTaskForComments(updated);
    }
    setCommentInput('');
  };

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unassigned';
  const getCustomerName = (id?: string) => id ? customers.find(c => c.id === id)?.company || 'Corporate Client' : '';

  return (
    <div className="space-y-4">
      {/* Search & Action Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[200px] flex-1 md:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="pl-3 pr-8 py-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task Assignment</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);
          return (
            <div key={column.id} className="bg-slate-50 border border-slate-250/50 rounded-xl p-4 flex flex-col min-h-[450px]">
              {/* Column Title Header */}
              <div className={`border-l-4 px-3 py-1.5 rounded-r-md flex items-center justify-between mb-4 font-bold text-xs shadow-xs ${column.color}`}>
                <span>{column.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded-md text-slate-600 border border-slate-200">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Tasks list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-0.5">
                {columnTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-[11px] text-slate-400 italic bg-white border border-dashed border-slate-200 rounded-xl">
                    No tasks in this stage.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all relative text-left group"
                    >
                      {/* Priority and Actions bar */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          task.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                          task.priority === 'High' ? 'bg-amber-50 text-amber-700' :
                          task.priority === 'Medium' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              if (confirm('Delete task record?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title and description */}
                      <h5 className="font-bold text-slate-800 text-xs leading-snug">{task.title}</h5>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">{task.description}</p>

                      {/* Associated Client link if any */}
                      {task.customerId && (
                        <div className="mt-2.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[9px] font-semibold text-slate-500 inline-block max-w-full truncate">
                          Client: {getCustomerName(task.customerId)}
                        </div>
                      )}

                      {/* Meta information row */}
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 mt-3 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-600 truncate max-w-[85px]">
                            {getEmployeeName(task.assignedEmployeeId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-500">{task.deadline}</span>
                        </div>
                      </div>

                      {/* Control buttons & comment counts */}
                      <div className="flex items-center justify-between gap-2 mt-3.5 border-t border-slate-50 pt-2 shrink-0">
                        <button
                          onClick={() => setSelectedTaskForComments(task)}
                          className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{task.comments.length} Comments</span>
                        </button>

                        {/* Arrows for fast state transitions */}
                        <div className="flex items-center gap-1">
                          {task.status !== 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, task.status, 'prev')}
                              className="p-1 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded"
                              title="Move back"
                            >
                              ←
                            </button>
                          )}
                          {task.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, task.status, 'next')}
                              className="p-1 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded"
                              title="Move forward"
                            >
                              →
                            </button>
                          )}
                          {task.status === 'Completed' && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Done
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: CREATE NEW TASK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Assign New BackOffice Task</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formTask.title}
                  onChange={(e) => setFormTask({...formTask, title: e.target.value})}
                  placeholder="Review monthly tax returns or Audit contracts"
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Task Detailed Description</label>
                <textarea
                  value={formTask.description}
                  onChange={(e) => setFormTask({...formTask, description: e.target.value})}
                  placeholder="Explain requirements, files needed, or sub-tasks..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Assigned Employee</label>
                  <select
                    value={formTask.assignedEmployeeId}
                    onChange={(e) => setFormTask({...formTask, assignedEmployeeId: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Task Priority</label>
                  <select
                    value={formTask.priority}
                    onChange={(e) => setFormTask({...formTask, priority: e.target.value as any})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Deadline Target Date *</label>
                  <input
                    type="date"
                    required
                    value={formTask.deadline}
                    onChange={(e) => setFormTask({...formTask, deadline: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Link Customer (Optional)</label>
                  <select
                    value={formTask.customerId}
                    onChange={(e) => setFormTask({...formTask, customerId: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    <option value="">Unlinked (General Task)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  Log Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: COMMENTS & DISCUSSION FEED */}
      {selectedTaskForComments && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-xs">Task Discussion & Files</span>
              <button onClick={() => setSelectedTaskForComments(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <h4 className="font-extrabold text-slate-800 text-sm">{selectedTaskForComments.title}</h4>
                <p className="text-slate-500 italic mt-0.5">{selectedTaskForComments.description || 'No description.'}</p>
              </div>

              {/* Comments Feed list */}
              <div className="border-t border-b border-slate-100 py-3 max-h-56 overflow-y-auto space-y-3.5 pr-1">
                {selectedTaskForComments.comments.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4">No logged comments. Start the team sync!</p>
                ) : (
                  selectedTaskForComments.comments.map((comment) => (
                    <div key={comment.id} className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{comment.author}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Post comment details or onboarding query..."
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
