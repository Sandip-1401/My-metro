/**
 * Domain Types for Ahmedabad Metro Routing & Fare Calculation Engine
 */

export interface StationNode {
  id: string; // Database UUID
  code: string; // Unique station code (e.g., 'THGM', 'OLDH')
  name: string; // English station name (e.g., 'Thaltej Gam')
  gujaratiName?: string | null;
  hindiName?: string | null;
  isInterchange: boolean;
  lines: string[]; // Lines passing through this station (e.g., ['BLUE_LINE', 'RED_LINE'])
}

export interface GraphEdge {
  toStationId: string;
  toStationCode: string;
  lineCode: string; // Line identifier (e.g., 'BLUE_LINE')
  distanceKm: number; // Distance between stations in km
  travelTimeMinutes: number; // Expected travel time in minutes
}

export type AdjacencyList = Map<string, GraphEdge[]>;

export interface MetroGraph {
  stations: Map<string, StationNode>; // key: stationCode
  adjacencyList: AdjacencyList; // key: stationCode -> outgoing edges
}

export type RouteAction = 'BOARD' | 'RIDE' | 'INTERCHANGE' | 'ALIGHT';

export interface RouteStep {
  stepNumber: number;
  stationCode: string;
  stationName: string;
  lineCode: string;
  distanceFromPrevKm: number;
  travelTimeMinutes: number;
  action: RouteAction;
  notes?: string;
}

export interface RouteResult {
  origin: StationNode;
  destination: StationNode;
  path: RouteStep[];
  totalDistanceKm: number;
  totalTravelTimeMinutes: number;
  interchangeCount: number;
  interchangeStations: string[]; // Station codes where line transfer occurs
  fareInr: number;
}

export interface FareRule {
  minDistanceKm: number;
  maxDistanceKm: number | null; // null means unbounded (above minDistanceKm)
  fareInr: number;
}
