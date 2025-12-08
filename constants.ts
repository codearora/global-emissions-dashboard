import { Asset, EmissionDataPoint, SectorEmissionResponse } from "./types";

export const generateDashboardContext = (
  data: EmissionDataPoint[],
  assets: Asset[],
  sectors: SectorEmissionResponse
) => {
  if (!data || data.length === 0) return "No data available. The API might be down.";

  const latest = data[data.length - 1];
  const startYear = data[0].year;
  const endYear = latest.year;
  const topAsset = assets.length > 0 ? `${assets[0].name} (${assets[0].country})` : 'N/A';

  const sectorSummary = sectors?.all ?? [];

  // Example usage: sum all sector emissions
  const totalSectorEmissions = sectorSummary.reduce((sum, s) => sum + s.Emissions, 0);

  const isUSA = latest.Energy < 10;
  const scope = isUSA ? "United States (Climate Trace API)" : "Global";

  return `
You are an intelligent assistant integrated into the "EcoInsight" Dashboard.
Current Dataset: ${scope} Greenhouse Gas Emissions (in Billion Tonnes CO2e) from ${startYear} to ${endYear}.
Key Sectors tracked: Energy, Industry Processes, Agriculture, Transportation, and Waste.

Data Summary (Latest Data - ${endYear}):
- Energy: ${latest.Energy} Gt
- Industry: ${latest.Industry} Gt
- Transport: ${latest.Transport} Gt
- Agriculture: ${latest.Agriculture} Gt
- Waste: ${latest.Waste} Gt

Top High-Emission Asset on Watchlist: ${topAsset}

Sector Emissions (Sum): ${totalSectorEmissions} Mt CO2e

Trends:
- Analyse the provided data range from ${startYear} to ${endYear}.
- Note any dips (e.g., around 2020 due to COVID-19) or rises.

Your Role:
1. Answer questions specifically about this data.
2. If the user asks about external factors, future predictions beyond ${endYear}, or specific policies, USE THE GOOGLE SEARCH TOOL to find the latest information.
3. Be concise, professional, and data-driven.
`;
};
