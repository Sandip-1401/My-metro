import { describe, it, expect } from 'vitest';
import { buildMetroGraph, type RawConnection } from './graph';
import type { StationNode } from './types';

describe('Metro Graph Builder Engine', () => {
  // Mock Stations (Ahmedabad Metro sample)
  const mockStations: StationNode[] = [
    {
      id: 'uuid-1',
      code: 'THGM',
      name: 'Thaltej Gam',
      gujaratiName: 'થલતેજ ગામ',
      hindiName: 'थलतेज गाँव',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    },
    {
      id: 'uuid-2',
      code: 'THLT',
      name: 'Thaltej',
      gujaratiName: 'થલતેજ',
      hindiName: 'थलતેજ',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    },
    {
      id: 'uuid-3',
      code: 'OHCT',
      name: 'Old High Court',
      gujaratiName: 'જૂની હાઇકોર્ટ',
      hindiName: 'पुराना उच्च न्यायालय',
      isInterchange: true,
      lines: ['BLUE_LINE', 'RED_LINE'],
    },
  ];

  // Bidirectional Connections between THGM <-> THLT and THLT <-> OHCT
  const mockConnections: RawConnection[] = [
    // THGM <-> THLT
    {
      fromStationCode: 'THGM',
      toStationId: 'uuid-2',
      toStationCode: 'THLT',
      lineCode: 'BLUE_LINE',
      distanceKm: 1.4,
      travelTimeMinutes: 2,
    },
    {
      fromStationCode: 'THLT',
      toStationId: 'uuid-1',
      toStationCode: 'THGM',
      lineCode: 'BLUE_LINE',
      distanceKm: 1.4,
      travelTimeMinutes: 2,
    },
    // THLT <-> OHCT
    {
      fromStationCode: 'THLT',
      toStationId: 'uuid-3',
      toStationCode: 'OHCT',
      lineCode: 'BLUE_LINE',
      distanceKm: 7.5,
      travelTimeMinutes: 12,
    },
    {
      fromStationCode: 'OHCT',
      toStationId: 'uuid-2',
      toStationCode: 'THLT',
      lineCode: 'BLUE_LINE',
      distanceKm: 7.5,
      travelTimeMinutes: 12,
    },
  ];

  it('should correctly build a MetroGraph with stations and adjacency list', () => {
    const graph = buildMetroGraph(mockStations, mockConnections);

    // 1. Check Stations Map
    expect(graph.stations.size).toBe(3);
    expect(graph.stations.has('THGM')).toBe(true);
    expect(graph.stations.has('OHCT')).toBe(true);

    const ohct = graph.stations.get('OHCT');
    expect(ohct?.name).toBe('Old High Court');
    expect(ohct?.isInterchange).toBe(true);
    expect(ohct?.lines).toContain('BLUE_LINE');
    expect(ohct?.lines).toContain('RED_LINE');

    // 2. Check Adjacency List (Connections)
    expect(graph.adjacencyList.size).toBe(3);

    // THGM sirf THLT se connect hona chahiye (1 connection)
    const thgmEdges = graph.adjacencyList.get('THGM') ?? [];
    expect(thgmEdges).toHaveLength(1);
    expect(thgmEdges[0].toStationCode).toBe('THLT');
    expect(thgmEdges[0].distanceKm).toBe(1.4);

    // THLT beech me hai, dono (THGM aur OHCT) se judna chahiye (2 connections)
    const thltEdges = graph.adjacencyList.get('THLT') ?? [];
    expect(thltEdges).toHaveLength(2);
    const destinationCodes = thltEdges.map((e) => e.toStationCode);
    expect(destinationCodes).toContain('THGM');
    expect(destinationCodes).toContain('OHCT');

    // OHCT wapas THLT se judna chahiye (1 connection)
    const ohctEdges = graph.adjacencyList.get('OHCT') ?? [];
    expect(ohctEdges).toHaveLength(1);
    expect(ohctEdges[0].toStationCode).toBe('THLT');
  });

  it('should handle stations with no connections gracefully', () => {
    const isolatedStation: StationNode = {
      id: 'uuid-isolated',
      code: 'ISOL',
      name: 'Isolated Station',
      isInterchange: false,
      lines: ['BLUE_LINE'],
    };

    const graph = buildMetroGraph([isolatedStation], []);
    expect(graph.stations.size).toBe(1);
    expect(graph.adjacencyList.get('ISOL')).toEqual([]);
  });
});
