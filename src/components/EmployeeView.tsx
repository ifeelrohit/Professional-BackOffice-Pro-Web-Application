import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  UserCheck, 
  Briefcase, 
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Employee, Customer, Task } from '../types';

interface EmployeeViewProps {
  employees: Employee[];
  customers: Customer[];
  tasks: Task[];
  onCreateEmployee: (employeeData: any) => Promise<void>;
  onUpdateEmployee: (id: string, updates: any) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

export default function EmployeeView({
  employees,
  customers,
  tasks,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}: EmployeeViewProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formEmp, setFormEmp] = useState({
    name: '',
    email: '',
    role: 'Executive' as Employee['role'],
    department: 'Sales & Support',
    phone: ''
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmp.name || !formEmp.email) return;
    await onCreateEmployee(formEmp);
    setShowAddModal(false);
    setFormEmp({
      name: '',
      email: '',
      role: 'Executive',
      department: 'Sales & Support',
      phone: ''
    });
  };

  const handleAttendanceChange = async (empId: string, dateStr: string, currentStatus: 'Present' | 'Absent' | 'Leave') => {
    const nextStatusMap: Record<string, 'Present' | 'Absent' | 'Leave'> = {
      'Present': 'Leave',
      'Leave': 'Absent',
      'Absent': 'Present'
    };
    const nextStatus = nextStatusMap[currentStatus];

    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const updatedAttendance = emp.attendance.map(a => 
      a.date === dateStr ? { ...a, status: nextStatus } : a
    );

    await onUpdateEmployee(empId, { attendance: updatedAttendance });
  };

  const getAssignedCustomers = (empId: string) => customers.filter(c => c.assignedEmployeeId === empId).length;
  const getAssignedTasks = (empId: string) => tasks.filter(t => t.assignedEmployeeId === empId).length;

  return (
    <div className="space-y-4 text-left">
      
      {/* Control Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative min-w-[200px] w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search employees by name, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/10 transition-colors w-full md:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee Profile</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-400">
            No employee records match your search query.
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const customerCount = getAssignedCustomers(emp.id);
            const taskCount = getAssignedTasks(emp.id);

            return (
              <div 
                key={emp.id}
                className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-5 relative group text-xs"
              >
                {/* Score Gauge Circle */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-18 h-18">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-600" strokeWidth="3" strokeDasharray={`${emp.performanceScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-800 text-xs">
                      <span>{emp.performanceScore}</span>
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">KPI</span>
                    </div>
                  </div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-2.5 uppercase tracking-wide ${
                    emp.role === 'Admin' ? 'bg-red-50 text-red-700' :
                    emp.role === 'Manager' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {emp.role}
                  </span>
                </div>

                {/* Info and contacts */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-slate-800 text-sm">{emp.name}</h4>
                    <p className="font-semibold text-blue-600 uppercase text-[9px] tracking-wider">
                      {emp.department}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.email}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {emp.phone || '+1 (555) 010-0000'}
                    </p>
                  </div>

                  {/* Relations counts */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase">
                    <div className="bg-slate-50 border border-slate-100/60 px-2 py-1 rounded-lg">
                      <span className="text-slate-700 font-bold">{customerCount}</span> Customers
                    </div>
                    <div className="bg-slate-50 border border-slate-100/60 px-2 py-1 rounded-lg">
                      <span className="text-slate-700 font-bold">{taskCount}</span> Tasks
                    </div>
                  </div>
                </div>

                {/* Weekly Attendance Board */}
                <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 space-y-1.5">
                  <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block">Weekly Presence</span>
                  <div className="flex items-center gap-1">
                    {emp.attendance.map((att, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleAttendanceChange(emp.id, att.date, att.status)}
                        className={`w-7 h-8 rounded flex flex-col items-center justify-center cursor-pointer select-none border transition-all ${
                          att.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                          att.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                          'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title={`${att.date}: Click to cycle status`}
                      >
                        <span className="text-[8px] font-bold uppercase text-slate-400 scale-90 leading-none">
                          {new Date(att.date).toLocaleDateString([], { weekday: 'short' })[0]}
                        </span>
                        <span className="text-[10px] font-bold mt-0.5 leading-none">
                          {att.status[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete button absolute */}
                <button
                  onClick={() => {
                    if (confirm(`Remove employee profile ${emp.name}?`)) {
                      onDeleteEmployee(emp.id);
                    }
                  }}
                  className="absolute right-3 top-3 p-1.5 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: ADD EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Add Employee Profile</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formEmp.name}
                    onChange={(e) => setFormEmp({...formEmp, name: e.target.value})}
                    placeholder="E.g., Charlotte Dubois"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Operational Role *</label>
                  <select
                    value={formEmp.role}
                    onChange={(e) => setFormEmp({...formEmp, role: e.target.value as any})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Executive">Executive</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmp.email}
                    onChange={(e) => setFormEmp({...formEmp, email: e.target.value})}
                    placeholder="employee@backoffice.pro"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={formEmp.phone}
                    onChange={(e) => setFormEmp({...formEmp, phone: e.target.value})}
                    placeholder="+1 (555) 012-3456"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Department Assignment</label>
                <select
                  value={formEmp.department}
                  onChange={(e) => setFormEmp({...formEmp, department: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                >
                  <option value="Management">Management</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Sales & Support">Sales & Support</option>
                  <option value="Finance & Operations">Finance & Operations</option>
                </select>
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
