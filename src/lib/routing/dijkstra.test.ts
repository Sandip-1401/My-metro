import { describe, it, expect } from 'vitest';
import { calculateFare, findShortestRoute } from './dijkstra';
import { buildMetroGraph, type RawConnection } from './graph';
import type { StationNode, FareRule } from './types';

describe("Dijkstra's Shortest Path & Fare Calculation Engine", () => {
  // Official GMRC Ahmedabad Metro Fare Slabs
  const mockFareRules: FareRule[] = [
    { minDistanceKm: 0, maxDistanceKm: 2, fareInr: 5 },
    { minDistanceKm: 2.01, maxDistanceKm: 5, fareInr: 10 },
    { minDistanceKm: 5.01, maxDistanceKm: 8, fareInr: 15 },
    { minDistanceKm: 8.01, maxDistanceKm: 12, fareInr: 20 },
    { minDistanceKm: 12.01, maxDistanceKm: null, fareInr: 25 },
  ];

  // Mini Network:
  // Blue Line: THGM <-> THLT <-> OHCT
  // Red Line:  GDGM <-> OHCT <-> USMP
  // Isolated:  ISOL (no connections)
  const mockStations: StationNode[] = [
    {
      id: 'uuid-thgm',
      code: 'THGM',
      name: 'Thaltej Gam',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    },
    {
      id: 'uuid-thlt',
      code: 'THLT',
      name: 'Thaltej',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    },
    {
      id: 'uuid-ohct',
      code: 'OHCT',
      name: 'Old High Court',
      isInterchange: true,
      lines: ['BLUE_LINE', 'RED_LINE'],
    },
    {
      id: 'uuid-gdgm',
      code: 'GDGM',
      name: 'Gandhigram',
      isInterchange: false,
      lines: ['RED_LINE'],
    },
    {
      id: 'uuid-usmp',
      code: 'USMP',
      name: 'Usmanpura',
      isInterchange: false,
      lines: ['RED_LINE'],
    },
    {
      id: 'uuid-isol',
      code: 'ISOL',
      name: 'Isolated Station',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    },
  ];

  const mockConnections: RawConnection[] = [
    // Blue Line: THGM <-> THLT (1.4 km, 2 min)
    {
      fromStationCode: 'THGM',
      toStationId: 'uuid-thlt',
      toStationCode: 'THLT',
      lineCode: 'BLUE_LINE',
      distanceKm: 1.4,
      travelTimeMinutes: 2,
    },
    {
      fromStationCode: 'THLT',
      toStationId: 'uuid-thgm',
      toStationCode: 'THGM',
      lineCode: 'BLUE_LINE',
      distanceKm: 1.4,
      travelTimeMinutes: 2,
    },
    // Blue Line: THLT <-> OHCT (7.5 km, 12 min)
    {
      fromStationCode: 'THLT',
      toStationId: 'uuid-ohct',
      toStationCode: 'OHCT',
      lineCode: 'BLUE_LINE',
      distanceKm: 7.5,
      travelTimeMinutes: 12,
    },
    {
      fromStationCode: 'OHCT',
      toStationId: 'uuid-thlt',
      toStationCode: 'THLT',
      lineCode: 'BLUE_LINE',
      distanceKm: 7.5,
      travelTimeMinutes: 12,
    },
    // Red Line: GDGM <-> OHCT (1.1 km, 2 min)
    {
      fromStationCode: 'GDGM',
      toStationId: 'uuid-ohct',
      toStationCode: 'OHCT',
      lineCode: 'RED_LINE',
      distanceKm: 1.1,
      travelTimeMinutes: 2,
    },
    {
      fromStationCode: 'OHCT',
      toStationId: 'uuid-gdgm',
      toStationCode: 'GDGM',
      lineCode: 'RED_LINE',
      distanceKm: 1.1,
      travelTimeMinutes: 2,
    },
    // Red Line: OHCT <-> USMP (1.3 km, 2 min)
    {
      fromStationCode: 'OHCT',
      toStationId: 'uuid-usmp',
      toStationCode: 'USMP',
      lineCode: 'RED_LINE',
      distanceKm: 1.3,
      travelTimeMinutes: 2,
    },
    {
      fromStationCode: 'USMP',
      toStationId: 'uuid-ohct',
      toStationCode: 'OHCT',
      lineCode: 'RED_LINE',
      distanceKm: 1.3,
      travelTimeMinutes: 2,
    },
  ];

  const graph = buildMetroGraph(mockStations, mockConnections);

  describe('calculateFare()', () => {
    it('should correctly calculate fare for each GMRC distance slab', () => {
      expect(calculateFare(1.2, mockFareRules)).toBe(5); // <= 2 km
      expect(calculateFare(2.0, mockFareRules)).toBe(5); // boundary
      expect(calculateFare(3.5, mockFareRules)).toBe(10); // 2.01 - 5 km
      expect(calculateFare(6.2, mockFareRules)).toBe(15); // 5.01 - 8 km
      expect(calculateFare(9.5, mockFareRules)).toBe(20); // 8.01 - 12 km
      expect(calculateFare(14.0, mockFareRules)).toBe(25); // > 12 km
    });

    it('should return fallback base fare (5) if fareRules is empty', () => {
      expect(calculateFare(5.0, [])).toBe(5);
    });
  });

  describe('findShortestRoute()', () => {
    it('should return null for non-existent station codes', () => {
      const result = findShortestRoute(graph, 'NON_EXISTENT', 'THGM', mockFareRules);
      expect(result).toBeNull();
    });

    it('should handle same-station trip (origin === destination)', () => {
      const result = findShortestRoute(graph, 'THGM', 'THGM', mockFareRules);

      expect(result).not.toBeNull();
      expect(result?.totalDistanceKm).toBe(0);
      expect(result?.totalTravelTimeMinutes).toBe(0);
      expect(result?.interchangeCount).toBe(0);
      expect(result?.fareInr).toBe(5);
      expect(result?.path).toHaveLength(1);
      expect(result?.path[0].action).toBe('BOARD');
    });

    it('should find single-hop route on same line (THGM -> THLT)', () => {
      const result = findShortestRoute(graph, 'THGM', 'THLT', mockFareRules);

      expect(result).not.toBeNull();
      expect(result?.totalDistanceKm).toBe(1.4);
      expect(result?.totalTravelTimeMinutes).toBe(2);
      expect(result?.interchangeCount).toBe(0);
      expect(result?.fareInr).toBe(5);

      // Path: BOARD at THGM, ALIGHT at THLT
      expect(result?.path).toHaveLength(2);
      expect(result?.path[0].action).toBe('BOARD');
      expect(result?.path[0].stationCode).toBe('THGM');
      expect(result?.path[1].action).toBe('ALIGHT');
      expect(result?.path[1].stationCode).toBe('THLT');
    });

    it('should find multi-hop route on same line (THGM -> OHCT)', () => {
      const result = findShortestRoute(graph, 'THGM', 'OHCT', mockFareRules);

      expect(result).not.toBeNull();
      // Total distance: 1.4 + 7.5 = 8.9 km
      expect(result?.totalDistanceKm).toBe(8.9);
      expect(result?.totalTravelTimeMinutes).toBe(14); // 2 + 12
      expect(result?.interchangeCount).toBe(0);
      expect(result?.fareInr).toBe(20); // 8.01 - 12 km slab

      // Path: BOARD(THGM) -> RIDE(THLT) -> ALIGHT(OHCT)
      expect(result?.path).toHaveLength(3);
      expect(result?.path[0].action).toBe('BOARD');
      expect(result?.path[1].action).toBe('RIDE');
      expect(result?.path[1].stationCode).toBe('THLT');
      expect(result?.path[2].action).toBe('ALIGHT');
      expect(result?.path[2].stationCode).toBe('OHCT');
    });

    it('should correctly detect INTERCHANGE when switching lines (THLT -> USMP via OHCT)', () => {
      const result = findShortestRoute(graph, 'THLT', 'USMP', mockFareRules);

      expect(result).not.toBeNull();
      // Path: THLT --[BLUE]--> OHCT --[RED]--> USMP
      // Distance: 7.5 + 1.3 = 8.8 km
      expect(result?.totalDistanceKm).toBe(8.8);
      expect(result?.totalTravelTimeMinutes).toBe(14); // 12 + 2

      // Interchange checks
      expect(result?.interchangeCount).toBe(1);
      expect(result?.interchangeStations).toEqual(['OHCT']);

      // Steps:
      // 1. BOARD at THLT (BLUE_LINE)
      // 2. INTERCHANGE at OHCT (Transfer to RED_LINE)
      // 3. ALIGHT at USMP (RED_LINE)
      expect(result?.path).toHaveLength(3);
      expect(result?.path[0].action).toBe('BOARD');
      expect(result?.path[0].stationCode).toBe('THLT');

      expect(result?.path[1].action).toBe('INTERCHANGE');
      expect(result?.path[1].stationCode).toBe('OHCT');
      expect(result?.path[1].notes).toBe('Transfer to RED_LINE');

      expect(result?.path[2].action).toBe('ALIGHT');
      expect(result?.path[2].stationCode).toBe('USMP');
    });

    it('should return null for disconnected/unreachable station', () => {
      const result = findShortestRoute(graph, 'THGM', 'ISOL', mockFareRules);
      expect(result).toBeNull();
    });
  });
});
