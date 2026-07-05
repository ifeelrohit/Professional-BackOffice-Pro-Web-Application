import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Layers 
} from 'lucide-react';
import { ReportStats } from '../types';

interface ReportViewProps {
  stats: ReportStats | null;
  onRefreshStats: () => Promise<void>;
}

export default function ReportView({ stats, onRefreshStats }: ReportViewProps) {
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [loaderStep, setLoaderStep] = useState(0);

  const loaderSteps = [
    'Aggregating BackOffice customer portfolios...',
    'Analyzing employee task allocations and backlogs...',
    'Calculating conversion vectors on sales leads...',
    'Consulting with Gemini Executive Intelligence...',
    'Compiling diagnostic audit summaries...'
  ];

  // Cycle loader steps during AI generation
  useEffect(() => {
    let interval: any;
    if (loadingAI) {
      setLoaderStep(0);
      interval = setInterval(() => {
        setLoaderStep(prev => (prev < loaderSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoaderStep(0);
    }
    return () => clearInterval(interval);
  }, [loadingAI]);

  const triggerAIReport = async () => {
    setLoadingAI(true);
    setAiError('');
    setAiReport('');
    try {
      const res = await fetch('/api/reports/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setAiReport(data.summary);
      } else {
        setAiError(data.details || 'Gemini model is currently offline. Ensure GEMINI_API_KEY is configured.');
      }
    } catch (e: any) {
      setAiError('Network connection failed. Could not communicate with the full-stack report server.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-slate-500">Compiling report structures...</p>
      </div>
    );
  }

  const kpiList = [
    { title: 'Total Customers Registered', value: stats.kpis.totalCustomers, category: 'Customers', target: '98% Steady Retention' },
    { title: 'Active Operational Accounts', value: stats.kpis.activeCustomers, category: 'Customers', target: 'Growth focus' },
    { title: 'Remaining Pending Task Logs', value: stats.kpis.pendingTasks, category: 'Tasks', target: 'Resolve < 48hrs' },
    { title: 'Completed Team Assignments', value: stats.kpis.completedTasks, category: 'Tasks', target: '95% Efficiency SLA' },
    { title: 'Total Pipeline Lead Cards', value: stats.kpis.totalLeads, category: 'Leads', target: 'Inbounds active' },
    { title: 'Successfully Won Accounts', value: stats.kpis.convertedLeads, category: 'Leads', target: 'Convert high value' },
    { title: 'Stored Operations Files', value: stats.kpis.documentsUploaded, category: 'Documents', target: 'Fully KYC Audited' },
    { title: 'Monthly SaaS Revenue', value: `$${stats.kpis.estimatedRevenue.toLocaleString()}`, category: 'Finance', target: '1.5k average MRR per client' }
  ];

  return (
    <div className="space-y-6 text-left text-xs">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setReportType('Daily')} 
            className={`px-3 py-1.5 rounded-lg font-semibold border ${reportType === 'Daily' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Daily
          </button>
          <button 
            onClick={() => setReportType('Weekly')} 
            className={`px-3 py-1.5 rounded-lg font-semibold border ${reportType === 'Weekly' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setReportType('Monthly')} 
            className={`px-3 py-1.5 rounded-lg font-semibold border ${reportType === 'Monthly' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setReportType('Yearly')} 
            className={`px-3 py-1.5 rounded-lg font-semibold border ${reportType === 'Yearly' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Yearly
          </button>
        </div>

        <button
          onClick={onRefreshStats}
          className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 font-bold shrink-0 transition-colors"
          title="Refresh statistics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database Metrics</span>
        </button>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Report table card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-150 bg-slate-50/75 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">{reportType} KPI Operational Report</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Operational Registry</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-slate-600">
              <thead className="bg-slate-50/40 border-b border-slate-200 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold text-left">Metric Specification</th>
                  <th className="px-5 py-3 font-semibold text-left">Context Division</th>
                  <th className="px-5 py-3 font-semibold text-right">Registered Value</th>
                  <th className="px-5 py-3 font-semibold text-right">Target Constraint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {kpiList.map((kpi, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-3 text-slate-800 font-bold">{kpi.title}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">
                        {kpi.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{kpi.value}</td>
                    <td className="px-5 py-3 text-right text-slate-400 font-semibold">{kpi.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI report panel card */}
        <div className="lg:col-span-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 text-white justify-between h-[450px]">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm leading-none">AI Executive Analyst</h4>
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 block">Gemini 3.5 Flash</span>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed text-left">
              Generate a commercial-grade, multi-vector operational consulting report analyzing your live database metrics.
            </p>
          </div>

          {/* Report Display or Loading or Default state */}
          <div className="flex-1 overflow-y-auto my-4 border border-slate-800 bg-slate-950/60 p-4 rounded-xl flex flex-col justify-center min-h-[150px]">
            {loadingAI ? (
              <div className="space-y-4.5 py-4 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[11px] font-bold text-blue-400 tracking-wide">
                    Diagnostics Active
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-slate-800 rounded-full animate-pulse w-full"></div>
                  <div className="h-2.5 bg-slate-800 rounded-full animate-pulse w-[85%]"></div>
                  <div className="h-2.5 bg-slate-800 rounded-full animate-pulse w-[92%]"></div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed animate-fade-in text-left">
                  Status: {loaderSteps[loaderStep]}
                </p>
              </div>
            ) : aiError ? (
              <div className="space-y-2 text-center py-4 flex-1 flex flex-col justify-center items-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 stroke-1" />
                <p className="text-xs font-bold text-slate-200">Operations Insight Paused</p>
                <p className="text-[10px] text-slate-500 leading-normal max-w-[200px]">{aiError}</p>
              </div>
            ) : aiReport ? (
              <div className="text-left text-[11px] leading-relaxed text-slate-300 space-y-3 whitespace-pre-line overflow-y-auto h-full pr-1 font-sans">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[9px] tracking-widest pb-1 border-b border-slate-900 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" /> Intelligence Compiled
                </div>
                <p>{aiReport}</p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2.5">
                <Bot className="w-10 h-10 text-slate-700 mx-auto stroke-1" />
                <p className="text-xs text-slate-400 font-semibold">Diagnostic Report Standby</p>
              </div>
            )}
          </div>

          {/* Trigger button */}
          <button
            onClick={triggerAIReport}
            disabled={loadingAI}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingAI ? 'Running Diagnostics...' : 'Generate BackOffice Intelligence'}</span>
          </button>

        </div>

      </div>

    </div>
  );
}
