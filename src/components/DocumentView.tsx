import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  FolderOpen,
  Filter
} from 'lucide-react';
import { Document, Customer } from '../types';

interface DocumentViewProps {
  documents: Document[];
  customers: Customer[];
  onUploadDocument: (docData: any) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  currentUser: any;
}

export default function DocumentView({
  documents,
  customers,
  onUploadDocument,
  onDeleteDocument,
  currentUser
}: DocumentViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Document['category']>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'KYC' as Document['category'],
    customerId: '',
    fileBase64: '',
    fileSize: '',
    mimeType: ''
  });

  const categories: Document['category'][] = [
    'KYC', 'Invoices', 'Contracts', 'Identity Proof', 'Business Documents', 'Others'
  ];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      const sizeStr = file.size >= 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setFormData(prev => ({
        ...prev,
        name: file.name,
        fileBase64: base64,
        fileSize: sizeStr,
        mimeType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    await onUploadDocument({
      name: formData.name,
      category: formData.category,
      size: formData.fileSize || '15 KB',
      mimeType: formData.mimeType || 'application/octet-stream',
      fileData: formData.fileBase64,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
      customerId: formData.customerId || undefined
    });

    setShowUploadModal(false);
    setFormData({
      name: '',
      category: 'KYC',
      customerId: '',
      fileBase64: '',
      fileSize: '',
      mimeType: ''
    });
  };

  const downloadFile = (doc: Document) => {
    // Standard client fallback if raw data is missing
    const content = doc.fileData || `BackOffice Pro Document Payload: ${doc.name}\nCategory: ${doc.category}\nUploaded on: ${doc.createdDate}`;
    const blob = new Blob([content], { type: doc.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCustomerCompanyName = (id?: string) => id ? customers.find(c => c.id === id)?.company || 'Corporate Client' : 'General File';

  return (
    <div className="space-y-4">
      {/* Action panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[200px] flex-1 md:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="pl-3 pr-8 py-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/10 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-3.5">
            <FolderOpen className="w-10 h-10 text-slate-300 stroke-1" />
            <p className="text-xs text-slate-400 italic">No files match your current category and search filter.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-44 text-left group"
            >
              {/* Header and Deletion */}
              <div className="flex items-start justify-between gap-2 shrink-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete document record ${doc.name}?`)) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Document details */}
              <div className="space-y-1 my-2 flex-1 min-w-0">
                <h5 className="font-bold text-slate-800 text-xs truncate leading-tight" title={doc.name}>
                  {doc.name}
                </h5>
                <span className="inline-block px-1.5 py-0.2 bg-slate-50 text-slate-500 font-semibold text-[9px] rounded uppercase">
                  {doc.category}
                </span>
                <p className="text-[10px] text-slate-400 truncate">
                  Client: {getCustomerCompanyName(doc.customerId)}
                </p>
              </div>

              {/* File details footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 shrink-0">
                <div>
                  <p className="font-medium text-slate-500">{doc.size}</p>
                  <p className="text-[9px] text-slate-400">By {doc.uploadedByName}</p>
                </div>
                <button
                  onClick={() => downloadFile(doc)}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors flex items-center justify-center"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal: UPLOAD NEW DOCUMENT */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Upload New Operations Document</span>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Drag n drop styled selector zone */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Select Document File *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/10 transition-colors flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="font-bold text-slate-700">Click to browse registration file</span>
                  <span className="text-[10px] text-slate-400">PDF, Excel, Word, Zip, or Image up to 10MB</span>
                  
                  {formData.name && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 mt-2">
                      <FileText className="w-4 h-4" /> {formData.name} ({formData.fileSize})
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Document Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Link Customer (Optional)</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  >
                    <option value="">Unlinked (General Document)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
