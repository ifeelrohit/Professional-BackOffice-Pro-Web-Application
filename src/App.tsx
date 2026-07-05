import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Lock, 
  Sparkles, 
  TrendingUp,
  Search,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { 
  User as UserType, 
  Customer, 
  Task, 
  Document, 
  Employee, 
  Lead, 
  Notification, 
  ActivityLog, 
  CompanySettings, 
  ReportStats 
} from './types';

// Importing Custom Views
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CustomerView from './components/CustomerView';
import TaskView from './components/TaskView';
import DocumentView from './components/DocumentView';
import EmployeeView from './components/EmployeeView';
import LeadView from './components/LeadView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@backoffice.pro');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // App Navigation States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data Registries
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);

  // Global Operations States
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');

  // Auto load session on mount (Simulated via local storage or direct fetch)
  useEffect(() => {
    const savedUser = localStorage.getItem('bo_pro_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bo_pro_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch all database registries if logged in
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    setLoading(true);
    setGeneralError('');
    try {
      const [
        custRes, 
        taskRes, 
        docRes, 
        empRes, 
        leadRes, 
        notifRes, 
        logsRes, 
        settingsRes, 
        statsRes
      ] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/tasks'),
        fetch('/api/documents'),
        fetch('/api/employees'),
        fetch('/api/leads'),
        fetch('/api/notifications'),
        fetch('/api/activity-logs'),
        fetch('/api/settings'),
        fetch('/api/reports/stats')
      ]);

      if (!custRes.ok || !taskRes.ok || !docRes.ok || !empRes.ok || !leadRes.ok || !notifRes.ok || !logsRes.ok || !settingsRes.ok || !statsRes.ok) {
        throw new Error('Some API pipelines failed to load.');
      }

      const [
        custData, 
        taskData, 
        docData, 
        empData, 
        leadData, 
        notifData, 
        logsData, 
        settingsData, 
        statsData
      ] = await Promise.all([
        custRes.json(),
        taskRes.json(),
        docRes.json(),
        empRes.json(),
        leadRes.json(),
        notifRes.json(),
        logsRes.json(),
        settingsRes.json(),
        statsRes.json()
      ]);

      setCustomers(custData);
      setTasks(taskData);
      setDocuments(docData);
      setEmployees(empData);
      setLeads(leadData);
      setNotifications(notifData);
      setActivityLogs(logsData);
      setCompanySettings(settingsData);
      setStats(statsData);
    } catch (e: any) {
      setGeneralError('Could not contact full-stack server database APIs.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bo_pro_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
      } else {
        setLoginError(data.message || 'Invalid operational credentials.');
      }
    } catch (err: any) {
      setLoginError('Could not contact authentication server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bo_pro_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // KPI Statistics re-sync helper
  const handleRefreshStats = async () => {
    try {
      const res = await fetch('/api/reports/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {}
  };

  // --- CUSTOMERS CRUD CALLBACKS ---
  const handleCreateCustomer = async (custData: any) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...custData, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateCustomer = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updates, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}?userId=${currentUser?.id}&userName=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleAddCustomerNote = async (id: string, content: string) => {
    try {
      const res = await fetch(`/api/customers/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          createdBy: currentUser?.name, 
          userId: currentUser?.id 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleImportCustomers = async (csvText: string) => {
    try {
      const res = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          csvText, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- TASKS CRUD CALLBACKS ---
  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...taskData, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updates, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}?userId=${currentUser?.id}&userName=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleAddTaskComment = async (id: string, content: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          author: currentUser?.name, 
          userId: currentUser?.id 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- DOCUMENTS CALLBACKS ---
  const handleUploadDocument = async (docData: any) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}?userId=${currentUser?.id}&userName=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- EMPLOYEES CRUD CALLBACKS ---
  const handleCreateEmployee = async (empData: any) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...empData, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateEmployee = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updates, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}?userId=${currentUser?.id}&userName=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- LEADS CRUD CALLBACKS ---
  const handleCreateLead = async (leadData: any) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...leadData, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updates, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}?userId=${currentUser?.id}&userName=${currentUser?.name}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- SETTINGS CALLBACKS ---
  const handleUpdateSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updates, 
          userId: currentUser?.id, 
          userName: currentUser?.name 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // --- NOTIFICATIONS READS CALLBACKS ---
  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {}
  };

  // Quick Action redirection shortcut
  const handleQuickAction = (action: 'customer' | 'task' | 'document' | 'lead') => {
    const tabMap = {
      customer: 'customers',
      task: 'tasks',
      document: 'documents',
      lead: 'leads'
    };
    setActiveTab(tabMap[action]);
  };

  // Global search filters matching items from all models
  const getGlobalSearchResults = () => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    const matchedCustomers = customers.filter(c => c.name.toLowerCase().includes(query) || c.company.toLowerCase().includes(query));
    const matchedTasks = tasks.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    const matchedLeads = leads.filter(l => l.name.toLowerCase().includes(query) || l.company.toLowerCase().includes(query));
    const matchedDocs = documents.filter(d => d.name.toLowerCase().includes(query));

    return {
      customers: matchedCustomers,
      tasks: matchedTasks,
      leads: matchedLeads,
      documents: matchedDocs
    };
  };

  // Render Loader State
  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading operator session...</p>
      </div>
    );
  }

  // --- GATED LOGIN VIEW SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-xs">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden flex flex-col animate-slide-up">
          
          {/* Accent Header */}
          <div className="bg-slate-950 p-7 text-center relative text-white">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold">BackOffice<span className="text-blue-500">Pro</span></h1>
            <p className="text-slate-400 text-[10px] mt-1 font-semibold uppercase tracking-widest">Operator Authorization Gate</p>
          </div>

          {/* Login Form content */}
          <form onSubmit={handleLogin} className="p-7 space-y-4 text-left">
            {loginError && (
              <div className="bg-red-50 border border-red-150 p-3 rounded-lg text-red-800 font-bold flex items-start gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 mt-0.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">Operator Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@backoffice.pro"
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase tracking-wider text-[9px]">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white font-bold rounded-xl shadow-md shadow-blue-600/15 transition-colors text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loggingIn ? 'Authenticating Operator...' : 'Authorize Operator'}</span>
            </button>

            {/* Quick credentials helper */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-2 mt-4 text-[10px] text-slate-500">
              <p className="font-bold text-slate-700">Pre-seeded Demo Accounts (Password: <span className="font-mono font-extrabold text-blue-600">password123</span>):</p>
              <ul className="list-disc list-inside space-y-1 font-medium pl-1">
                <li><span className="text-slate-800 font-bold">Admin:</span> admin@backoffice.pro</li>
                <li><span className="text-slate-800 font-bold">Manager:</span> manager@backoffice.pro</li>
                <li><span className="text-slate-800 font-bold">Executive:</span> executive@backoffice.pro</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const searchResults = getGlobalSearchResults();

  // --- Dynamic Tab Navigation Switching ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            stats={stats} 
            activityLogs={activityLogs} 
            tasks={tasks} 
            onNavigate={setActiveTab} 
          />
        );
      case 'customers':
        return (
          <CustomerView
            customers={customers}
            employees={employees}
            tasks={tasks}
            documents={documents}
            onCreateCustomer={handleCreateCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onAddNote={handleAddCustomerNote}
            onImportCustomers={handleImportCustomers}
          />
        );
      case 'tasks':
        return (
          <TaskView
            tasks={tasks}
            employees={employees}
            customers={customers}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTaskComment={handleAddTaskComment}
          />
        );
      case 'documents':
        return (
          <DocumentView
            documents={documents}
            customers={customers}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            currentUser={currentUser}
          />
        );
      case 'employees':
        return (
          <EmployeeView
            employees={employees}
            customers={customers}
            tasks={tasks}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'leads':
        return (
          <LeadView
            leads={leads}
            employees={employees}
            onCreateLead={handleCreateLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'reports':
        return (
          <ReportView 
            stats={stats} 
            onRefreshStats={handleRefreshStats} 
          />
        );
      case 'settings':
        if (!companySettings) return null;
        return (
          <SettingsView
            settings={companySettings}
            currentUser={currentUser}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-left">
            <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-sm">System Operations Alerts</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">No recent logged alerts.</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-4 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4 ${!notif.read ? 'bg-blue-50/10' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 text-xs">{notif.title}</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{new Date(notif.createdDate).toLocaleDateString()} at {new Date(notif.createdDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkNotificationRead(notif.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-[10px] font-bold rounded transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'activity-logs':
        return (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-left">
            <div className="px-5 py-4 border-b border-slate-150 bg-slate-50">
              <h4 className="font-extrabold text-slate-800 text-sm">Operation Audit Stream Logs</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-slate-600">
                <thead className="text-[10px] text-slate-400 bg-slate-50/40 border-b border-slate-150 uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Log Date / Time</th>
                    <th className="px-5 py-3 text-left">Module Segment</th>
                    <th className="px-5 py-3 text-left">Trigger Action details</th>
                    <th className="px-5 py-3 text-left">Executor Representative</th>
                    <th className="px-5 py-3 text-right">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-[11px]">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">No auditing events logged.</td>
                    </tr>
                  ) : (
                    activityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-5 py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-800 font-bold">{log.action}</td>
                        <td className="px-5 py-3">{log.userName} (ID: {log.userId})</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-xs">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Main Right Area Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <Header
          currentUser={currentUser}
          unreadCount={unreadCount}
          notifications={notifications}
          onLogout={handleLogout}
          onNavigate={setActiveTab}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onQuickAction={handleQuickAction}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Core dynamic content workspace */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {/* General API Communication Error Alert banner */}
          {generalError && (
            <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-red-800 font-bold mb-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{generalError}</span>
              </div>
              <button 
                onClick={fetchAllData} 
                className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-bold transition-all shrink-0"
              >
                Retry API sync
              </button>
            </div>
          )}

          {/* Search Result Overlay Workspace if searchQuery is active */}
          {searchQuery.trim() ? (
            <div className="space-y-4 text-left animate-fade-in bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-800">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>Search Registry matches for: "{searchQuery}"</span>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition-colors"
                >
                  Clear search
                </button>
              </div>

              {/* Customers matches */}
              {searchResults?.customers && searchResults.customers.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Matched Customers</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {searchResults.customers.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveTab('customers');
                        }}
                        className="p-3 border border-slate-150 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 cursor-pointer rounded-xl flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{c.company} • {c.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks matches */}
              {searchResults?.tasks && searchResults.tasks.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Matched Tasks</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {searchResults.tasks.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveTab('tasks');
                        }}
                        className="p-3 border border-slate-150 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 cursor-pointer rounded-xl flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{t.title}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{t.priority} priority • Due {t.deadline}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads matches */}
              {searchResults?.leads && searchResults.leads.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Matched Pipeline Leads</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {searchResults.leads.map(l => (
                      <div 
                        key={l.id} 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveTab('leads');
                        }}
                        className="p-3 border border-slate-150 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 cursor-pointer rounded-xl flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{l.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{l.company} • {l.source} • Status: {l.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents matches */}
              {searchResults?.documents && searchResults.documents.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Matched Documents</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {searchResults.documents.map(d => (
                      <div 
                        key={d.id} 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveTab('documents');
                        }}
                        className="p-3 border border-slate-150 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 cursor-pointer rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="font-bold text-slate-800">{d.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{d.category} • Size {d.size}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults?.customers.length === 0 && searchResults?.tasks.length === 0 && searchResults?.leads.length === 0 && searchResults?.documents.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-semibold">
                  No matches in Customers, Tasks, Leads, or Documents registries.
                </div>
              )}
            </div>
          ) : (
            renderTabContent()
          )}

        </main>
      </div>
    </div>
  );
}
