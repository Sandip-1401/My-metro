export interface StationNode {
  id: string;
  code: string;
  name: string;
  gujaratiName?: string | null;
  hindiName?: string | null;
  isInterchange: boolean;
  lines: string[];
}

export interface GraphEdge {
  toStationId: string;
  toStationCode: string;
  lineCode: string;
  distanceKm: number;
  travelTimeMinutes: number;
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
