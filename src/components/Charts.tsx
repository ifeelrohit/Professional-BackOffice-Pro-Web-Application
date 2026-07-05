import { useState } from 'react';
import { ChartDataPoint } from '../types';

interface ChartProps {
  data: ChartDataPoint[];
}

export function CustomerGrowthChart({ data }: ChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 200;
  const padding = 40;

  // Find max and min
  const maxVal = Math.max(...data.map(d => d.count || 0), 10);
  
  // Coordinates mapping
  const getX = (index: number) => padding + (index * (width - padding * 2)) / (data.length - 1);
  const getY = (val: number) => height - padding - (val * (height - padding * 2)) / maxVal;

  // Build path
  let pathD = '';
  let areaD = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.count || 0);
    if (i === 0) {
      pathD += `M ${x} ${y}`;
      areaD += `M ${x} ${height - padding} L ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
      areaD += ` L ${x} ${y}`;
    }
    if (i === data.length - 1) {
      areaD += ` L ${x} ${height - padding} Z`;
    }
  });

  return (
    <div className="relative bg-white p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Customer Growth</h4>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 4} fill="#94A3B8" fontSize="10" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaD} fill="url(#blue-gradient)" opacity="0.1" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* X axis labels & data points */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.count || 0);
            return (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                <circle cx={x} cy={y} r={hoverIndex === i ? 6 : 4} fill={hoverIndex === i ? '#1D4ED8' : '#2563EB'} stroke="#FFFFFF" strokeWidth="2" className="cursor-pointer transition-all duration-150" />
                <text x={x} y={height - 12} fill="#94A3B8" fontSize="11" textAnchor="middle">{d.name}</text>
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div 
            className="absolute bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-100"
            style={{ 
              left: `${(getX(hoverIndex) / width) * 100}%`, 
              top: `${(getY(data[hoverIndex].count || 0) / height) * 100 - 4}%` 
            }}
          >
            <p className="font-semibold">{data[hoverIndex].name}</p>
            <p className="text-blue-300">{data[hoverIndex].count} Customers</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function RevenueTrendsChart({ data }: ChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 200;
  const padding = 45;

  const maxVal = Math.max(...data.map(d => d.revenue || 0), 1000);
  const barWidth = 32;

  const getX = (index: number) => padding + (index * (width - padding * 2)) / data.length + (width - padding * 2) / (data.length * 2);
  const getY = (val: number) => height - padding - (val * (height - padding * 2)) / maxVal;

  return (
    <div className="relative bg-white p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Monthly Revenue ($)</h4>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                <text x={padding - 8} y={y + 4} fill="#94A3B8" fontSize="10" textAnchor="end">${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}</text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = getX(i) - barWidth / 2;
            const y = getY(d.revenue || 0);
            const barHeight = height - padding - y;
            const isHovered = hoverIndex === i;

            return (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
                {/* Rounded bar with hover elevation */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={Math.max(barHeight, 2)} 
                  rx="6" 
                  fill={isHovered ? '#1D4ED8' : '#2563EB'} 
                  className="transition-colors duration-150"
                />
                {/* Text labels */}
                <text x={getX(i)} y={height - 12} fill="#94A3B8" fontSize="11" textAnchor="middle">{d.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverIndex !== null && (
          <div 
            className="absolute bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-100"
            style={{ 
              left: `${(getX(hoverIndex) / width) * 100}%`, 
              top: `${(getY(data[hoverIndex].revenue || 0) / height) * 100 - 4}%` 
            }}
          >
            <p className="font-semibold">{data[hoverIndex].name}</p>
            <p className="text-emerald-400">${data[hoverIndex].revenue?.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskCompletionChart({ data }: ChartProps) {
  if (!data || data.length === 0) return null;

  const size = 160;
  const radius = 60;
  const strokeWidth = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;

  // Colors mapping for status levels
  const colorMap: Record<string, string> = {
    'Completed': '#22C55E', // success green
    'In Progress': '#3B82F6', // indigo/blue
    'Pending': '#F59E0B', // warning gold
    'Overdue': '#EF4444' // danger red
  };

  let accumulatedAngle = 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 h-full flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Task Allocation</h4>
      <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
        {/* Ring Chart */}
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            {data.map((d, i) => {
              const val = d.value || 0;
              if (val === 0) return null;

              const pct = val / total;
              const strokeDashoffset = circumference - pct * circumference;
              const rotation = (accumulatedAngle * 360) / total;
              accumulatedAngle += val;

              return (
                <circle 
                  key={i}
                  cx={center} 
                  cy={center} 
                  r={radius} 
                  fill="transparent" 
                  stroke={colorMap[d.name] || '#64748B'} 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  transform={`rotate(${-90 + rotation} ${center} ${center})`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{total}</span>
            <span className="text-xs text-slate-400">Total Tasks</span>
          </div>
        </div>

        {/* Legends */}
        <div className="flex flex-col gap-2.5">
          {data.map((d, i) => {
            const val = d.value || 0;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorMap[d.name] || '#64748B' }} />
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{d.name}</span>: {val} ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
