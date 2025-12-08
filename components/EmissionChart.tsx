import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Sector {
    Sector: string;
    Emissions: number;
}

interface Props {
    sectors: { all: Sector[] };
}

// 5 vibrant colors for the aggregated sectors
const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

const sectorCategoryMap: Record<string, string> = {
    // Energy
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

    // fallback
    "other": "Other"
};

const EmissionsGraph: React.FC<Props> = ({ sectors }) => {
    // Aggregate emissions by 5 categories
    const categoryTotals: Record<string, number> = { Energy: 0, Industry: 0, Transport: 0, Mining: 0, Other: 0 };
    sectors.all.forEach(s => {
        const category = sectorCategoryMap[s.Sector] ?? 'Other';
        categoryTotals[category] += s.Emissions;
    });

    // Prepare chart data
    const chartData = [{ name: 'Latest', ...categoryTotals }];

    const formatEmissionsMt = (value: number) => `${(value / 1e6).toFixed(1)} Mt`;

    return (
        <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatEmissionsMt} />
                    <Tooltip formatter={(value: number) => formatEmissionsMt(value)} />
                    <Legend />
                    {Object.keys(categoryTotals).map((key, idx) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={COLORS[idx % COLORS.length]}
                            isAnimationActive={true}
                            radius={[5, 5, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmissionsGraph;
