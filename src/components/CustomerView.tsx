import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  X, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  FileText, 
  CheckSquare, 
  User, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Customer, Employee, Task, Document, Note } from '../types';

interface CustomerViewProps {
  customers: Customer[];
  employees: Employee[];
  tasks: Task[];
  documents: Document[];
  onCreateCustomer: (customerData: any) => Promise<void>;
  onUpdateCustomer: (id: string, updates: any) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onAddNote: (id: string, content: string) => Promise<void>;
  onImportCustomers: (csvText: string) => Promise<void>;
}

export default function CustomerView({
  customers,
  employees,
  tasks,
  documents,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddNote,
  onImportCustomers
}: CustomerViewProps) {
  // Navigation & Page States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'createdDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [newCust, setNewCust] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    gst: '',
    address: '',
    assignedEmployeeId: 'usr-3'
  });
  
  const [noteText, setNoteText] = useState('');
  const [csvInput, setCsvInput] = useState('');

  // Sorting / Filtering Logic
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let fieldA = a[sortBy].toLowerCase();
      let fieldB = b[sortBy].toLowerCase();
      if (sortBy === 'createdDate') {
        fieldA = a.createdDate;
        fieldB = b.createdDate;
      }
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'name' | 'company' | 'createdDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.company) return;
    await onCreateCustomer(newCust);
    setShowAddModal(false);
    setNewCust({
      name: '',
      company: '',
      email: '',
      phone: '',
      gst: '',
      address: '',
      assignedEmployeeId: 'usr-3'
    });
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedCustomer) return;
    await onAddNote(selectedCustomer.id, noteText);
    
    // Update local modal state dynamically
    const updatedCust = customers.find(c => c.id === selectedCustomer.id);
    if (updatedCust) {
      setSelectedCustomer(updatedCust);
    }
    setNoteText('');
  };

  const handleCSVImport = async () => {
    if (!csvInput.trim()) return;
    await onImportCustomers(csvInput);
    setShowImportModal(false);
    setCsvInput('');
  };

  const handleCSVExport = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'GST', 'Address', 'Status', 'CreatedDate'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        `"${c.name}"`,
        `"${c.company}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.gst}"`,
        `"${c.address.replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${c.createdDate}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Profile metadata counts
  const getCustomerTasks = (custId: string) => tasks.filter(t => t.customerId === custId);
  const getCustomerDocs = (custId: string) => documents.filter(d => d.customerId === custId);

  return (
    <div className="space-y-4">
      {/* Top Controls Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 md:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-3 pr-8 py-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors">
                  <div className="flex items-center gap-1.5">
                    Customer Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('company')} className="px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors">
                  <div className="flex items-center gap-1.5">
                    Company <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">GST Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td 
                      onClick={() => setSelectedCustomer(c)}
                      className="px-6 py-4 font-bold text-slate-800"
                    >
                      {c.name}
                    </td>
                    <td 
                      onClick={() => setSelectedCustomer(c)}
                      className="px-6 py-4 font-semibold text-slate-500"
                    >
                      {c.company}
                    </td>
                    <td 
                      onClick={() => setSelectedCustomer(c)}
                      className="px-6 py-4 space-y-0.5"
                    >
                      <p className="text-slate-700">{c.email}</p>
                      <p className="text-slate-400">{c.phone}</p>
                    </td>
                    <td 
                      onClick={() => setSelectedCustomer(c)}
                      className="px-6 py-4 font-mono text-slate-500 uppercase"
                    >
                      {c.gst || 'N/A'}
                    </td>
                    <td onClick={() => setSelectedCustomer(c)} className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        c.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete customer profile? This will unlink associated records.')) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-100 bg-slate-50/30">
          <span className="text-xs text-slate-400">
            Showing Page <span className="text-slate-700 font-bold">{currentPage}</span> of <span className="text-slate-700 font-bold">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: ADD CUSTOMER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Add Customer Profile</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCust.name}
                    onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                    placeholder="E.g., John Doe"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCust.company}
                    onChange={(e) => setNewCust({...newCust, company: e.target.value})}
                    placeholder="E.g., Apex Tech Labs"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    value={newCust.email}
                    onChange={(e) => setNewCust({...newCust, email: e.target.value})}
                    placeholder="john@company.com"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({...newCust, phone: e.target.value})}
                    placeholder="+1 (555) 012-3456"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">GST Identification No.</label>
                  <input
                    type="text"
                    value={newCust.gst}
                    onChange={(e) => setNewCust({...newCust, gst: e.target.value})}
                    placeholder="27AAAAA1111A1Z1"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Assigned CSM Executive</label>
                  <select
                    value={newCust.assignedEmployeeId}
                    onChange={(e) => setNewCust({...newCust, assignedEmployeeId: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Office Billing Address</label>
                <textarea
                  value={newCust.address}
                  onChange={(e) => setNewCust({...newCust, address: e.target.value})}
                  placeholder="Street suite, state, pincode"
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 resize-none"
                />
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
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: IMPORT CUSTOMERS CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Import Customers via CSV</span>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-lg font-mono text-[10px] text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Required Format:</p>
                <p>name,company,email,phone,gst,address</p>
                <p>Robert Johnson,Zenith Group,rob@zenith.com,+1 222 333,27AAAB1,Austin TX</p>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Paste CSV Contents</label>
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Paste csv comma-separated rows here..."
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 font-mono resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={!csvInput.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  Process Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal/Slide-Over: CUSTOMER DETAILS (PROFILE INSPECTOR) */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in">
          <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left overflow-hidden">
            {/* Slide Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="font-bold text-slate-800 text-sm">Customer Profile Inspector</span>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Initials Banner Header */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-extrabold text-xl shrink-0">
                  {selectedCustomer.name[0]}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{selectedCustomer.name}</h3>
                  <p className="font-semibold text-slate-400 text-xs flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedCustomer.company}
                  </p>
                </div>
              </div>

              {/* Contact Info Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col text-left">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Direct Contacts</span>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {selectedCustomer.email || 'No email provided'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {selectedCustomer.phone || 'No phone number'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex flex-col text-left">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Office Details</span>
                  <p className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{selectedCustomer.address || 'No billing address'}</span>
                  </p>
                  <p className="text-slate-400 font-semibold pl-6 uppercase">GST: {selectedCustomer.gst || 'N/A'}</p>
                </div>
              </div>

              {/* Linked Records Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Linked Tasks</span>
                    <p className="text-lg font-bold text-slate-800">{getCustomerTasks(selectedCustomer.id).length}</p>
                  </div>
                  <CheckSquare className="w-8 h-8 text-blue-500/10 shrink-0" />
                </div>
                <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Uploaded Docs</span>
                    <p className="text-lg font-bold text-slate-800">{getCustomerDocs(selectedCustomer.id).length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-emerald-500/10 shrink-0" />
                </div>
              </div>

              {/* Add / Read Note timeline section */}
              <div className="space-y-3">
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Customer Timeline & Notes</span>
                
                {/* Timeline Notes List */}
                <div className="space-y-3.5 pl-2 border-l border-slate-100 max-h-48 overflow-y-auto pr-1">
                  {selectedCustomer.notes.length === 0 ? (
                    <p className="text-slate-400 italic py-2 pl-3">No recorded activity timeline entries.</p>
                  ) : (
                    selectedCustomer.notes.map((note) => (
                      <div key={note.id} className="relative pl-5 text-left">
                        <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
                        <div className="bg-slate-50 border border-slate-100/80 p-2.5 rounded-lg space-y-1">
                          <p className="text-slate-700 leading-relaxed">{note.content}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            By {note.createdBy} • {new Date(note.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to log note */}
                <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Log a call or type an onboarding update note..."
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shrink-0"
                  >
                    Log Note
                  </button>
                </form>
              </div>

              {/* Document Registry List */}
              <div className="space-y-2.5">
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Document Registry</span>
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden">
                  {getCustomerDocs(selectedCustomer.id).length === 0 ? (
                    <div className="p-3 text-center text-slate-400 italic">No linked registration files.</div>
                  ) : (
                    getCustomerDocs(selectedCustomer.id).map(doc => (
                      <div key={doc.id} className="p-2.5 bg-slate-50/55 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-700 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{doc.category} • {doc.size}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
