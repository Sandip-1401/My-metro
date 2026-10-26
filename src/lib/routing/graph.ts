import type { StationNode, MetroGraph, AdjacencyList } from './types';

export interface RawConnection {
  fromStationCode: string;
  toStationId: string;
  toStationCode: string;
  lineCode: string;
  distanceKm: number;
  travelTimeMinutes: number;
}

/**
 * Builds an in-memory MetroGraph (Adjacency List + Stations Map)
 * from station nodes and connection records.
 */
export function buildMetroGraph(
  stations: StationNode[],
  connections: RawConnection[]
): MetroGraph {
  const stationsMap = new Map<string, StationNode>();
  const adjacencyList: AdjacencyList = new Map();

  // 1. Har station ko register karo aur uske liye khali raste ([]) initialize karo
  for (const station of stations) {
    stationsMap.set(station.code, station);
    adjacencyList.set(station.code, []);
  }

  // 2. Har connection ko uske starting station ke lifafe (array) me push karo
  for (const conn of connections) {
    const edges = adjacencyList.get(conn.fromStationCode);
    if (edges) {
      edges.push({
        toStationId: conn.toStationId,
        toStationCode: conn.toStationCode,
        lineCode: conn.lineCode,
        distanceKm: conn.distanceKm,
        travelTimeMinutes: conn.travelTimeMinutes,
      });
    }
  }

  // 3. Dono Maps ko pack karke return karo
  return {
    stations: stationsMap,
    adjacencyList,
  };
}
