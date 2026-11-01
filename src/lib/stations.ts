import { db } from '@/db';

// 1. Ek line ki jaankari (Blue Line / Red Line)
export interface StationLineInfo {
  lineCode: string;       // e.g. 'BLUE_LINE'
  displayName: string;    // e.g. 'Blue Line'
  color: string;          // e.g. '#2563eb'
  sequenceOrder: number;  // Train sequence: 1, 2, 3...
}

// 2. Ek Station ki poori jaankari
export interface StationWithLines {
  id: string;
  code: string;
  name: string;
  gujaratiName: string | null;
  hindiName: string | null;
  isInterchange: boolean;
  hasElevator: boolean;
  hasParking: boolean;
  lines: StationLineInfo[]; // Ek station multiple lines par ho sakta hai (jaise Old High Court)
}

/**
 * Database se saare 32 stations aur unki lines fetch karna
 * Optional lineCode: 'BLUE_LINE' ya 'RED_LINE' se filter kar sakte hain.
 */
export async function getAllStations(lineCode?: string): Promise<StationWithLines[]> {
  // 1. Database query (relations ke saath)
  const stationsData = await db.query.stations.findMany({
    with: {
      stationLines: {
        with: {
          line: true, // Saath me line ka naam, color, sequence bhi le aao
        },
      },
    },
    orderBy: (stations, { asc }) => [asc(stations.name)], // A to Z sort
  });

  // 2. Raw database data ko saaf-suthre 'StationWithLines' format me arrange karke 'formatted' variable me store kiya
  const formatted: StationWithLines[] = stationsData.map((station) => ({
    id: station.id,
    code: station.code,
    name: station.name,
    gujaratiName: station.gujaratiName,
    hindiName: station.hindiName,
    isInterchange: station.isInterchange,
    hasElevator: station.hasElevator,
    hasParking: station.hasParking,
    lines: station.stationLines.map((sl) => ({
      lineCode: sl.line.code,
      displayName: sl.line.displayName,
      color: sl.line.color,
      sequenceOrder: sl.sequenceOrder,
    })),
  }));

  // 3. Agar koi filter nahi diya, ya 'ALL' diya, toh saare stations return kar do
  if (!lineCode || lineCode === 'ALL') {
    return formatted;
  }

  // 4. Agar user ne 'BLUE_LINE' ya 'RED_LINE' maanga, toh filter karo
  const normalized = lineCode.toUpperCase();
  const filtered = formatted.filter((station) =>
    station.lines.some((l) => l.lineCode === normalized)
  );

  // 5. Train ke station number (sequenceOrder: 1, 2, 3...) ke hisaab se sort kar do
  return filtered.sort((a, b) => {
    const aSeq = a.lines.find((l) => l.lineCode === normalized)?.sequenceOrder ?? 0;
    const bSeq = b.lines.find((l) => l.lineCode === normalized)?.sequenceOrder ?? 0;
    return aSeq - bSeq;
  });
}

