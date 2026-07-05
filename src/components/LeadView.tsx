import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Globe, 
  Smartphone, 
  Award, 
  Calendar,
  X,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, Employee } from '../types';

interface LeadViewProps {
  leads: Lead[];
  employees: Employee[];
  onCreateLead: (leadData: any) => Promise<void>;
  onUpdateLead: (id: string, updates: any) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export default function LeadView({
  leads,
  employees,
  onCreateLead,
  onUpdateLead,
  onDeleteLead
}: LeadViewProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formLead, setFormLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website' as Lead['source'],
    notes: '',
    followUpDate: '',
    assignedEmployeeId: 'usr-3'
  });

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const pipelineStages: Array<{ id: Lead['status']; title: string; color: string }> = [
    { id: 'New', title: 'New Leads', color: 'border-slate-400 bg-slate-500/10 text-slate-800' },
    { id: 'Contacted', title: 'Contacted', color: 'border-blue-500 bg-blue-500/10 text-blue-800' },
    { id: 'Qualified', title: 'Qualified', color: 'border-amber-500 bg-amber-500/10 text-amber-800' },
    { id: 'Converted', title: 'Converted', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-800' },
    { id: 'Lost', title: 'Closed/Lost', color: 'border-red-500 bg-red-500/10 text-red-800' }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLead.name || !formLead.company) return;
    await onCreateLead(formLead);
    setShowAddModal(false);
    setFormLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      source: 'Website',
      notes: '',
      followUpDate: '',
      assignedEmployeeId: 'usr-3'
    });
  };

  const handleStageShift = async (leadId: string, currentStatus: Lead['status'], direction: 'forward' | 'backward') => {
    const statuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Converted'];
    const idx = statuses.indexOf(currentStatus);
    
    // Check if moving to lost is handled separate or standard shift
    if (idx === -1 && currentStatus !== 'Lost') return;

    let nextStatus = currentStatus;
    if (direction === 'forward' && idx < statuses.length - 1) {
      nextStatus = statuses[idx + 1];
    } else if (direction === 'backward' && idx > 0) {
      nextStatus = statuses[idx - 1];
    }

    if (nextStatus !== currentStatus) {
      await onUpdateLead(leadId, { status: nextStatus });
    }
  };

  const getSourceIcon = (src: Lead['source']) => {
    switch (src) {
      case 'Website':
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
      case 'Phone':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Campaign':
        return <Target className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Email':
      case 'Referral':
      default:
        return <Mail className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Filters row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative min-w-[200px] w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads..."
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
          <span>Log New Lead Card</span>
        </button>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.status === stage.id);
          return (
            <div key={stage.id} className="bg-slate-50 border border-slate-250/50 rounded-xl p-3.5 flex flex-col min-h-[450px]">
              {/* Header */}
              <div className={`border-l-4 px-3 py-1.5 rounded-r-md flex items-center justify-between mb-4 font-bold text-xs shadow-xs ${stage.color}`}>
                <span className="truncate">{stage.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded-md text-slate-600 border border-slate-200 shrink-0 ml-1.5">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards block */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                {stageLeads.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-[10px] text-slate-400 italic bg-white border border-dashed border-slate-200 rounded-xl">
                    No active leads.
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all space-y-2.5 relative group"
                    >
                      <div className="flex items-start justify-between gap-1.5 shrink-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getSourceIcon(lead.source)}
                          <span className="text-[10px] text-slate-400 font-bold truncate leading-tight uppercase">
                            {lead.source}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete lead record?')) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Header info */}
                      <div className="space-y-0.5 text-left">
                        <h5 className="font-bold text-slate-800 text-xs leading-snug">{lead.name}</h5>
                        <p className="font-semibold text-slate-400 text-[10px]">{lead.company}</p>
                      </div>

                      {/* Notes snippet */}
                      {lead.notes && (
                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 bg-slate-50/50 p-1.5 border border-slate-100 rounded text-left">
                          {lead.notes}
                        </p>
                      )}

                      {/* Date & Shifts */}
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 mt-2 text-[10px] text-slate-400 font-semibold uppercase">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className={new Date(lead.followUpDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'}>
                            {lead.followUpDate}
                          </span>
                        </div>

                        {/* Pipeline controllers */}
                        <div className="flex items-center gap-1">
                          {lead.status !== 'New' && lead.status !== 'Lost' && (
                            <button
                              onClick={() => handleStageShift(lead.id, lead.status, 'backward')}
                              className="p-0.5 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded text-[9px]"
                              title="Demote Stage"
                            >
                              ←
                            </button>
                          )}
                          {lead.status !== 'Converted' && lead.status !== 'Lost' && (
                            <button
                              onClick={() => handleStageShift(lead.id, lead.status, 'forward')}
                              className="p-0.5 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded text-[9px]"
                              title="Promote Stage"
                            >
                              →
                            </button>
                          )}
                          {lead.status !== 'Lost' && lead.status !== 'Converted' && (
                            <button
                              onClick={async () => await onUpdateLead(lead.id, { status: 'Lost' })}
                              className="p-0.5 border border-red-200 text-red-500 hover:bg-red-50 rounded text-[9px] font-bold"
                              title="Mark as Lost"
                            >
                              X
                            </button>
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

      {/* Modal: CREATE LEAD */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Create New Business Lead Card</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Lead Representative Name *</label>
                  <input
                    type="text"
                    required
                    value={formLead.name}
                    onChange={(e) => setFormLead({...formLead, name: e.target.value})}
                    placeholder="E.g., Alice Johnson"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Organization Company *</label>
                  <input
                    type="text"
                    required
                    value={formLead.company}
                    onChange={(e) => setFormLead({...formLead, company: e.target.value})}
                    placeholder="E.g., Zenith Retailers"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    value={formLead.email}
                    onChange={(e) => setFormLead({...formLead, email: e.target.value})}
                    placeholder="email@organization.com"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={formLead.phone}
                    onChange={(e) => setFormLead({...formLead, phone: e.target.value})}
                    placeholder="+1 (555) 012-3456"
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Lead Source Channel</label>
                  <select
                    value={formLead.source}
                    onChange={(e) => setFormLead({...formLead, source: e.target.value as any})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    <option value="Website">Website Inbound</option>
                    <option value="Phone">Phone Query</option>
                    <option value="Campaign">Marketing Campaign</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Email">Direct Email</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Follow-up Target Date *</label>
                  <input
                    type="date"
                    required
                    value={formLead.followUpDate}
                    onChange={(e) => setFormLead({...formLead, followUpDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Initial Discovery Notes</label>
                <textarea
                  value={formLead.notes}
                  onChange={(e) => setFormLead({...formLead, notes: e.target.value})}
                  placeholder="E.g., Inquired about standard SaaS pricing packages, demo booked..."
                  rows={3}
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
                  Confirm Lead Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
