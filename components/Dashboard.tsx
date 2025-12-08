import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { EmissionDataPoint, SectorStat, Asset, SectorEmissionResponse } from '../types';
import MetricCard from './MetricCard';
import EmissionChart from './EmissionChart';

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f472b6', // Pink
];
interface DashboardProps {
  data: EmissionDataPoint[];
  assets: Asset[];
  sectors: SectorEmissionResponse;
  isLoading: boolean;
  onRetry: () => void;
  error?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ data, assets, sectors, isLoading, onRetry, error }) => {
  const sectorCategoryMap: Record<string, string> = {
    "electricity-generation": "Energy",
    "oil-and-gas-production": "Energy",
    "oil-and-gas-refining": "Energy",
    "oil-and-gas-transport": "Energy",
    "non-residential-onsite-fuel-usage": "Energy",

    "cement": "Industry",
    "aluminum": "Industry",
    "iron-and-steel": "Industry",
    "lime": "Industry",
    "chemicals": "Industry",
    "glass": "Industry",
    "bauxite-mining": "Industry",
    "coal-mining": "Industry",
    "copper-mining": "Industry",

    "domestic-aviation": "Transport",
    "domestic-shipping": "Transport",
    "international-aviation": "Transport",
    "international-shipping": "Transport"
  };

  // Transform sectors.all into chart data
  const categoryTotals = sectors.all.reduce(
    (acc: Record<string, number>, s) => {
      const category = sectorCategoryMap[s.Sector] ?? "Other";
      acc[category] = (acc[category] || 0) + s.Emissions;
      return acc;
    },
    { Energy: 0, Industry: 0, Transport: 0, Other: 0 }
  );

  const areaChartData = [
    {
      year: "Latest",
      Energy: categoryTotals.Energy,
      Industry: categoryTotals.Industry,
      Transport: categoryTotals.Transport
    }
  ];

  // const formatYAxis = (value: number) => `${(value / 1e9).toFixed(1)}B`; // optional formatting

  // Calculate total emissions
  const totalEmissions = sectors.all.reduce((sum, s) => sum + s.Emissions, 0);

  // Map to chart data
  const sectorStats = sectors.all.map((s, idx) => ({
    name: s.Sector,
    value: totalEmissions > 0 ? +(s.Emissions / totalEmissions * 100).toFixed(2) : 0,
    color: COLORS[idx % COLORS.length],
  }));

  // Memoize calculations to prevent unnecessary re-renders
  const { latestData, previousData, growth } = useMemo(() => {
    if (data.length === 0) return {
      latestData: null, previousData: null, growth: 0
    };

    const latest = data[data.length - 1];
    const prev = data.length > 1 ? data[data.length - 2] : latest;

    const total = Object.values(latest).reduce<number>((a, b) => (typeof b === 'number' && b !== latest.year) ? a + (b as number) : a, 0);
    const prevTotal = Object.values(prev).reduce<number>((a, b) => (typeof b === 'number' && b !== prev.year) ? a + (b as number) : a, 0);

    const growthPercent = prevTotal !== 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

    // Generate sector stats for the pie chart based on latest data
    const stats: SectorStat[] = [
      { name: 'Energy', value: latest.Energy, color: '#3b82f6' },
      { name: 'Industry', value: latest.Industry, color: '#8b5cf6' },
      { name: 'Agriculture', value: latest.Agriculture, color: '#10b981' },
      { name: 'Transport', value: latest.Transport, color: '#f59e0b' },
      { name: 'Waste', value: latest.Waste, color: '#ef4444' },
    ];

    return { latestData: latest, previousData: prev, sectorStats: stats, total, growth: growthPercent };
  }, [data]);

  const formatYAxis = (tick: number) => `${tick} Gt`;

  // Map each detailed sector into 5 main sectors
  const mainSectorMap: Record<string, string> = {
    // Energy-related
    "electricity-generation": "Energy",
    "oil-and-gas-production": "Energy",
    "oil-and-gas-refining": "Energy",
    "oil-and-gas-transport": "Energy",
    "non-residential-onsite-fuel-usage": "Energy",

    // Industry
    "cement": "Industry",
    "aluminum": "Industry",
    "iron-and-steel": "Industry",
    "chemicals": "Industry",
    "glass": "Industry",

    // Transport
    "domestic-aviation": "Transport",
    "domestic-shipping": "Transport",
    "international-aviation": "Transport",
    "international-shipping": "Transport",

    // Mining
    "bauxite-mining": "Mining",
    "coal-mining": "Mining",
    "copper-mining": "Mining",

    // Anything else
    "default": "Other"
  };

  // Aggregate emissions
  const aggregatedData: Record<string, number> = {
    Energy: 0,
    Industry: 0,
    Transport: 0,
    Mining: 0,
    Other: 0
  };

  sectors.all.forEach(s => {
    const sectorKey = mainSectorMap[s.Sector] || "Other";
    aggregatedData[sectorKey] += s.Emissions;
  });

  // Now you can safely use Gt conversion
  const latestDataGt = Object.fromEntries(
    Object.entries(aggregatedData).map(([k, v]) => [k, v / 1e9])
  );
  // Format tonnes to Million Tonnes (Mt) for better readability
  const formatEmissionsMt = (tonnes: number) => {
    return (tonnes / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' Mt';
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm animate-pulse">Fetching Climate Trace Data...</p>
        </div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
        <p className="text-slate-500 max-w-sm mb-6">
          {error || "Unable to load live data from the Climate Trace API. The API might be down or restricted."}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm font-medium"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emissions Overview</h1>
          <p className="text-slate-500 mt-2">Real-time analysis of GHG emissions & high-impact assets ({data[0].year}-{latestData.year}).</p>
        </div>
        <div className="flex gap-2">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 bg-white border-slate-200 text-slate-600`}>
            <span className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`}></span>
            <span className="text-sm font-medium">
              Source: Climate Trace API (Live)
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Emissions"
          value={(totalEmissions / 1e9).toFixed(2)} // convert to Gt
          unit="Gt CO2e"
          trendLabel="" // no trend
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          }
        />

        {/* Individual sector cards */}
        {['Energy', 'Industry', 'Transport', 'Mining', 'Other'].map((sector) => {
          // Find the first matching item in sectors.all for this sector
          const sectorData = sectors.all.find(s => {
            // Map original sectors to these 5 categories
            if (['electricity-generation', 'oil-and-gas-production', 'oil-and-gas-refining', 'oil-and-gas-transport', 'non-residential-onsite-fuel-usage'].includes(s.Sector) && sector === 'Energy') return true;
            if (['cement', 'aluminum', 'iron-and-steel', 'chemicals', 'glass'].includes(s.Sector) && sector === 'Industry') return true;
            if (['domestic-aviation', 'domestic-shipping', 'international-aviation', 'international-shipping'].includes(s.Sector) && sector === 'Transport') return true;
            if (['bauxite-mining', 'coal-mining', 'copper-mining'].includes(s.Sector) && sector === 'Mining') return true;
            if (!['electricity-generation', 'oil-and-gas-production', 'oil-and-gas-refining', 'oil-and-gas-transport', 'non-residential-onsite-fuel-usage', 'cement', 'aluminum', 'iron-and-steel', 'chemicals', 'glass', 'domestic-aviation', 'domestic-shipping', 'international-aviation', 'international-shipping', 'bauxite-mining', 'coal-mining', 'copper-mining'].includes(s.Sector) && sector === 'Other') return true;

            return false;
          });

          const value = sectorData ? (sectorData.Emissions / 1e9).toFixed(2) : '0.00'; // convert to Gt

          return (
            <MetricCard
              key={sector}
              title={`${sector} Sector`}
              value={value}
              unit="Gt"
              trendLabel="" // no trend
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z">
                  </path>
                </svg>
              }
            />
          );
        })}

        {/* Assets Tracked */}
        <MetricCard
          title="Assets Tracked"
          value={assets.length}
          unit="Sites"
          trendLabel=""
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
              </path>
            </svg>
          }
        />

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Sectors Emissions Trend</h3>
          </div>
          <EmissionChart sectors={sectors} />
        </div>

        {/* Breakdown Chart (Takes 1 column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Sector Distribution ({latestData.year ?? 'Latest'})
          </h3>
          <div className="flex-1 min-h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sectorStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ maxHeight: 60, overflowY: 'auto' }} // scrollable
                  formatter={(value) => <span className="text-slate-600 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="block text-3xl font-bold text-slate-900">100%</span>
                <span className="block text-xs text-slate-500">Breakdown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets & Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assets Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Major Emitters Watchlist</h3>
              <p className="text-xs text-slate-500">Top individual assets by emissions impact (Source: Climate Trace Assets API)</p>
            </div>
            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Asset Name</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Est. Emissions (Mt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{asset.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {asset.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize">{asset.sector.replace(/-/g, ' ')}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">
                      {formatEmissionsMt(asset.emissions)}
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400">No high-emission assets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;