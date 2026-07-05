import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  CheckCircle,
  FileText,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface HeaderProps {
  currentUser: UserType;
  unreadCount: number;
  notifications: Notification[];
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onQuickAction: (action: 'customer' | 'task' | 'document' | 'lead') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  currentUser,
  unreadCount,
  notifications,
  onLogout,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onQuickAction,
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickActionDropdown, setShowQuickActionDropdown] = useState(false);

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'Task Assigned':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Document Uploaded':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'Customer Added':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'Deadline Reminder':
      case 'System Alert':
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-25 flex items-center justify-between px-6 shrink-0">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search customers, tasks, leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActionDropdown(!showQuickActionDropdown)}
            onBlur={() => setTimeout(() => setShowQuickActionDropdown(false), 200)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
          
          {showQuickActionDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-fade-in">
              <button 
                onClick={() => onQuickAction('customer')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" /> Add Customer
              </button>
              <button 
                onClick={() => onQuickAction('task')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" /> Assign New Task
              </button>
              <button 
                onClick={() => onQuickAction('lead')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-500" /> Log Lead Card
              </button>
              <button 
                onClick={() => onQuickAction('document')}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" /> Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Recent Alerts</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      onMarkAllNotificationsRead();
                      setShowNotifDropdown(false);
                    }}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No recent notifications.</div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        onMarkNotificationRead(notif.id);
                        setShowNotifDropdown(false);
                      }}
                      className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !notif.read ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {new Date(notif.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowNotifDropdown(false);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            onBlur={() => setTimeout(() => setShowProfileDropdown(false), 250)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 hover:bg-slate-150 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200"
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
                {currentUser.name[0]}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-slate-700 text-xs animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100 text-left bg-slate-50/55 rounded-t-xl">
                <p className="font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" /> Log Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
