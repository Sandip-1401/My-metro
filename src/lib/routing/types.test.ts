import { describe, it, expect } from 'vitest';
import type { StationNode, GraphEdge, RouteStep, RouteResult } from './types';

describe('Metro Routing Domain Types', () => {
  it('should correctly model a station node and route step', () => {
    const mockStation: StationNode = {
      id: 'mock-uuid-1',
      code: 'OLDH',
      name: 'Old High Court',
      gujaratiName: 'જૂની હાઇકોર્ટ',
      hindiName: 'ओल्ड हाई कोर्ट',
      isInterchange: true,
      lines: ['BLUE_LINE', 'RED_LINE'],
    };

    const mockEdge: GraphEdge = {
      toStationId: 'mock-uuid-2',
      toStationCode: 'SPDM',
      lineCode: 'BLUE_LINE',
      distanceKm: 1.15,
      travelTimeMinutes: 2,
    };

    const mockStep: RouteStep = {
      stepNumber: 1,
      stationCode: mockStation.code,
      stationName: mockStation.name,
      lineCode: 'BLUE_LINE',
      distanceFromPrevKm: 0,
      travelTimeMinutes: 0,
      action: 'BOARD',
    };

    const mockResult: RouteResult = {
      origin: mockStation,
      destination: mockStation,
      path: [mockStep],
      totalDistanceKm: 0,
      totalTravelTimeMinutes: 0,
      interchangeCount: 0,
      interchangeStations: [],
      fareInr: 5,
    };

    expect(mockStation.code).toBe('OLDH');
    expect(mockStation.isInterchange).toBe(true);
    expect(mockStation.lines).toHaveLength(2);
    expect(mockEdge.distanceKm).toBe(1.15);
    expect(mockResult.path).toHaveLength(1);
    expect(mockResult.fareInr).toBe(5);
  });
});
