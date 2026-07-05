import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Check, 
  Save, 
  User, 
  Lock 
} from 'lucide-react';
import { CompanySettings, User as UserType } from '../types';

interface SettingsProps {
  settings: CompanySettings;
  currentUser: UserType;
  onUpdateSettings: (updates: any) => Promise<void>;
}

export default function SettingsView({ settings, currentUser, onUpdateSettings }: SettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'profile'>('company');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [formCompany, setFormCompany] = useState({
    companyName: settings.companyName,
    address: settings.address,
    gstNumber: settings.gstNumber,
    email: settings.email,
    phone: settings.phone,
    timezone: settings.timezone,
    currency: settings.currency,
    language: settings.language
  });

  const [formUser, setFormUser] = useState({
    name: currentUser.name,
    email: currentUser.email,
    password: '',
    confirmPassword: ''
  });

  const [tfaEnabled, setTfaEnabled] = useState(false);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(formCompany);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row min-h-[450px] overflow-hidden text-left text-xs">
      
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-52 border-r border-slate-150 bg-slate-50/50 p-4 shrink-0 flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => setActiveSubTab('company')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-bold transition-all text-left ${
            activeSubTab === 'company' 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Company Settings</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-bold transition-all text-left ${
            activeSubTab === 'profile' 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>User Profile Settings</span>
        </button>
      </div>

      {/* Settings Action forms */}
      <div className="flex-1 p-6 relative">
        {saveSuccess && (
          <div className="absolute top-6 right-6 bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {activeSubTab === 'company' ? (
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-800">Company Operations & Profiles</h3>
              <p className="text-slate-400 text-[11px]">Configure GST registration, business billing, and default regional currency configurations.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formCompany.companyName}
                  onChange={(e) => setFormCompany({...formCompany, companyName: e.target.value})}
                  placeholder="BackOffice Pro Technologies LLC"
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">GST Registration ID</label>
                <input
                  type="text"
                  value={formCompany.gstNumber}
                  onChange={(e) => setFormCompany({...formCompany, gstNumber: e.target.value})}
                  placeholder="27AAAAA1111A1Z1"
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 uppercase outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Support Operations Email *</label>
                <input
                  type="email"
                  required
                  value={formCompany.email}
                  onChange={(e) => setFormCompany({...formCompany, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Operations Phone</label>
                <input
                  type="text"
                  value={formCompany.phone}
                  onChange={(e) => setFormCompany({...formCompany, phone: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Billing Head Office Address</label>
              <textarea
                value={formCompany.address}
                onChange={(e) => setFormCompany({...formCompany, address: e.target.value})}
                placeholder="HQ Address line, Silicon Valley"
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 resize-none outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Regional Currency</label>
                <select
                  value={formCompany.currency}
                  onChange={(e) => setFormCompany({...formCompany, currency: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Timezone Offset</label>
                <select
                  value={formCompany.timezone}
                  onChange={(e) => setFormCompany({...formCompany, timezone: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                >
                  <option value="UTC">UTC (Coordinated Universal)</option>
                  <option value="PST/EST">EST / PST (North America)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Default Language</label>
                <select
                  value={formCompany.language}
                  onChange={(e) => setFormCompany({...formCompany, language: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm shadow-blue-600/10 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Company Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-left">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-800">Individual Profile Details</h3>
              <p className="text-slate-400 text-[11px]">Manage your operator credentials, and secure your account.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Your Full Name</label>
                <input
                  type="text"
                  disabled
                  value={formUser.name}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Operations Email</label>
                <input
                  type="text"
                  disabled
                  value={formUser.email}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Change Password Block */}
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-400" /> Password Credentials Placeholder
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={formUser.password}
                    onChange={(e) => setFormUser({...formUser, password: e.target.value})}
                    className="w-full p-2.5 border border-slate-250 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm secure password"
                    value={formUser.confirmPassword}
                    onChange={(e) => setFormUser({...formUser, confirmPassword: e.target.value})}
                    className="w-full p-2.5 border border-slate-250 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Mock Two Factor Check */}
            <div className="flex items-center justify-between p-4 border border-slate-150 rounded-xl bg-slate-50/20">
              <div className="space-y-0.5 text-left">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Enable Two-Factor Authentication (2FA)
                </span>
                <p className="text-slate-400 text-[10px]">Secure operator sessions using a companion dynamic authenticator OTP.</p>
              </div>
              <button
                type="button"
                onClick={() => setTfaEnabled(!tfaEnabled)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${tfaEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
