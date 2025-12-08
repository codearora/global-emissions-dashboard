import { EmissionDataPoint, Asset, SectorEmissionResponse } from '../types';

// Climate Trace API Endpoints
const CT_EMISSIONS_URL =
  'https://api.climatetrace.org/v6/country/emissions?iso=USA&since=2015&to=2023';
const CT_ASSETS_URL =
  'https://api.climatetrace.org/v6/assets?limit=20';

const CT_EMISSIONS_BY_SECTORS_URL =
  'https://api.climatetrace.org/v6/assets/emissions';

// Fetch with CORS fallback
const fetchWithProxyFallback = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) return await response.json();
    throw new Error(`Direct API Error: ${response.statusText}`);
  } catch (directError) {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    if (proxyResponse.ok) return await proxyResponse.json();
    throw directError;
  }
};

/** Sector name mapping helper (used only for assets if needed) */
const mapSector = (ctSector: string): keyof EmissionDataPoint | null => {
  if (!ctSector) return null;
  const s = ctSector.toLowerCase();

  if (s.includes('power') || s.includes('energy')) return 'Energy';
  if (s.includes('industry') || s.includes('manufacturing')) return 'Industry';
  if (s.includes('agri') || s.includes('land') || s.includes('forest'))
    return 'Agriculture';
  if (
    s.includes('transport') ||
    s.includes('aviation') ||
    s.includes('shipping')
  )
    return 'Transport';
  if (s.includes('waste')) return 'Waste';

  return null;
};

/**
 * COUNTRY EMISSIONS API FIX:
 * Returns ONE OBJECT:
 * {
 *   country: "USA",
 *   emissions: { co2, ch4, n2o, co2e_100yr }
 * }
 */
export const fetchEmissionData = async (): Promise<EmissionDataPoint[]> => {
  try {
    console.log(`Fetching Country Emissions from: ${CT_EMISSIONS_URL}`);
    const raw = await fetchWithProxyFallback(CT_EMISSIONS_URL);

    if (!raw || !raw.emissions) {
      console.warn('Unexpected country emissions format:', raw);
      return [];
    }

    // Total national emissions (metric tons)
    const co2e = raw.emissions.co2e_100yr;

    // Convert MT → GT
    const co2eGt = co2e / 1_000_000_000;

    // Build 2015–2023 time series (synthetic because API returns only totals)
    const years = Array.from({ length: 2023 - 2015 + 1 }, (_, i) => 2015 + i);

    // Approximate US sector split
    const split = {
      Energy: 0.4,
      Industry: 0.25,
      Agriculture: 0.15,
      Transport: 0.15,
      Waste: 0.05,
    };

    return years.map((year) => ({
      year,
      Energy: +(co2eGt * split.Energy).toFixed(2),
      Industry: +(co2eGt * split.Industry).toFixed(2),
      Agriculture: +(co2eGt * split.Agriculture).toFixed(2),
      Transport: +(co2eGt * split.Transport).toFixed(2),
      Waste: +(co2eGt * split.Waste).toFixed(2),
    }));
  } catch (error) {
    console.error('Failed to fetch emission data:', error);
    return [];
  }
};

export const fetchEmissionDataBySectors = async (): Promise<SectorEmissionResponse> => {
  try {
    console.log(`Fetching sector emissions from: ${CT_EMISSIONS_BY_SECTORS_URL}`);

    const json = await fetchWithProxyFallback(CT_EMISSIONS_BY_SECTORS_URL);

    if (!json?.all || !Array.isArray(json.all)) {
      console.warn('Invalid sector data format:', json);
      return { all: [] };
    }

    // Return exactly as the API provides
    return {
      all: json.all.map((item: any) => ({
        AssetCount: item.AssetCount ?? 0,
        Emissions: item.Emissions ?? 0,
        Year: item.Year ?? null,
        Month: item.Month ?? null,
        Gas: item.Gas ?? 'co2e_100yr',
        Sector: item.Sector ?? 'Unknown',
      })),
    };
  } catch (e) {
    console.error('Failed to fetch sector emissions:', e);
    return { all: [] };
  }
};

/**
 * ASSETS API FIX:
 * Real API uses:
 *  - Id
 *  - Name
 *  - Country
 *  - Sector
 *  - EmissionsSummary[]
 */
export const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    console.log(`Fetching Assets from: ${CT_ASSETS_URL}`);

    const json = await fetchWithProxyFallback(CT_ASSETS_URL);

    const assetsArray = json.assets;
    if (!Array.isArray(assetsArray)) {
      console.warn('Invalid assets format:', json);
      return [];
    }

    // Map, extract emissions, sanitize fields
    const mapped: Asset[] = assetsArray.map((item: any) => {
      const summary = item.EmissionsSummary?.find(
        (e: any) => e.Gas === 'co2e_100yr'
      );

      const emissions = summary?.EmissionsQuantity ?? 0;

      return {
        id: item.Id?.toString() ?? crypto.randomUUID(),
        name: item.Name ?? 'Unknown Asset',
        country: item.Country ?? 'N/A',
        sector: item.Sector ?? 'N/A',
        emissions,
        lastUpdate: '2023',
      };
    });

    // Sort by emissions and return top 10
    return mapped.sort((a, b) => b.emissions - a.emissions).slice(0, 10);
  } catch (e) {
    console.error('Failed to fetch assets:', e);
    return [];
  }
};
