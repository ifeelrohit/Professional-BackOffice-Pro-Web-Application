import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Clock, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  unreadCount: number;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  unreadCount,
  onLogout 
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'employees', label: 'Employees', icon: Briefcase },
    { id: 'leads', label: 'Leads', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-slate-950 text-slate-200 h-screen sticky top-0 transition-all duration-300 flex flex-col border-r border-slate-800/60 z-30 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight text-white select-none whitespace-nowrap">
              BackOffice<span className="text-blue-500">Pro</span>
            </span>
          )}
        </div>
        
        {/* Toggle button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 shrink-0 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}

              {/* Collapsed Tooltip */}
              {collapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 border border-slate-800 text-slate-100 text-xs py-1.5 px-2.5 rounded-md shadow-xl pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}

              {/* Badge indicator */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute shrink-0 flex items-center justify-center text-[10px] font-bold rounded-full ${
                  collapsed ? 'right-1 top-1 w-4 h-4' : 'right-3 w-5 h-5'
                } ${isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all group relative"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 shrink-0" />
          {!collapsed && <span className="ml-3 text-left">Logout</span>}
          {collapsed && (
            <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 border border-slate-800 text-red-400 text-xs py-1.5 px-2.5 rounded-md shadow-xl pointer-events-none z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
