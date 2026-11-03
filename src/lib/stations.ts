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

// 3. Ek connected/adjacent station (Agla ya pichla station)
export interface ConnectedStation {
  code: string;
  name: string;
  lineCode: string;
  lineColor: string;
  distanceKm: number;
  travelTimeMinutes: number;
}

// 4. Station detail page ke liye comprehensive model
export interface StationDetail extends StationWithLines {
  latitude: number | null;
  longitude: number | null;
  isOperational: boolean;
  connectedStations: ConnectedStation[];
}

// 5. Metro Line model (UI Filter buttons ke liye)
export interface MetroLineItem {
  id: string;
  code: string;
  name: string;
  displayName: string;
  color: string;
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

/**
 * Station code (e.g. 'THGM', 'OHCT') se ek single station ki poori detail fetch karna
 */
export async function getStationByCode(code: string): Promise<StationDetail | null> {
  const normalizedCode = code.trim().toUpperCase();

  // 1. Database se single station dhoondhna with its lines and connected stations
  const stationData = await db.query.stations.findFirst({
    where: (stations, { eq }) => eq(stations.code, normalizedCode),
    with: {
      stationLines: {
        with: {
          line: true,
        },
      },
      outgoingConnections: {
        with: {
          toStation: true,
          line: true,
        },
      },
    },
  });

  // Agar station code database me exist nahi karta
  if (!stationData) {
    return null;
  }

  // 2. StationDetail saanche me map karke return karna
  return {
    id: stationData.id,
    code: stationData.code,
    name: stationData.name,
    gujaratiName: stationData.gujaratiName,
    hindiName: stationData.hindiName,
    latitude: stationData.latitude ? parseFloat(stationData.latitude) : null,
    longitude: stationData.longitude ? parseFloat(stationData.longitude) : null,
    isInterchange: stationData.isInterchange,
    isOperational: stationData.isOperational,
    hasElevator: stationData.hasElevator,
    hasParking: stationData.hasParking,
    lines: stationData.stationLines.map((sl) => ({
      lineCode: sl.line.code,
      displayName: sl.line.displayName,
      color: sl.line.color,
      sequenceOrder: sl.sequenceOrder,
    })),
    connectedStations: stationData.outgoingConnections.map((conn) => ({
      code: conn.toStation.code,
      name: conn.toStation.name,
      lineCode: conn.line.code,
      lineColor: conn.line.color,
      distanceKm: parseFloat(conn.distanceKm),
      travelTimeMinutes: conn.travelTimeMinutes,
    })),
  };
}

/**
 * Saari active metro lines fetch karna (e.g. Blue Line, Red Line)
 * Station Directory UI me filter buttons ke liye use hota hai.
 */
export async function getAllMetroLines(): Promise<MetroLineItem[]> {
  const lines = await db.query.metroLines.findMany({
    where: (lines, { eq }) => eq(lines.isActive, true),
    orderBy: (lines, { asc }) => [asc(lines.name)],
  });

  return lines.map((l) => ({
    id: l.id,
    code: l.code,
    name: l.name,
    displayName: l.displayName,
    color: l.color,
  }));
}

