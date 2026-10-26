import type {
  MetroGraph,
  RouteStep,
  RouteResult,
  FareRule,
  GraphEdge,
} from './types';

/**
 * Calculates GMRC metro fare based on total distance and official fare slabs.
 */
export function calculateFare(distanceKm: number, fareRules: FareRule[]): number {
  for (const rule of fareRules) {
    const isAboveMin = distanceKm >= rule.minDistanceKm;
    const isBelowMax = rule.maxDistanceKm === null || distanceKm <= rule.maxDistanceKm;

    if (isAboveMin && isBelowMax) {
      return rule.fareInr;
    }
  }

  // Fallback to lowest base fare if no rule matched
  return 5;
}

/**
 * Dijkstra's Shortest Path Algorithm for Ahmedabad Metro.
 * Finds the shortest physical route, travel time, interchange steps, and fare.
 */
export function findShortestRoute(
  graph: MetroGraph,
  originCode: string,
  destinationCode: string,
  fareRules: FareRule[]
): RouteResult | null {
  const origin = graph.stations.get(originCode);
  const destination = graph.stations.get(destinationCode);

  // 1. Validation: Dono stations graph me maujood hone chahiye
  if (!origin || !destination) {
    return null;
  }

  // 2. Special Case: Agar origin aur destination same station ho
  if (originCode === destinationCode) {
    const initialStep: RouteStep = {
      stepNumber: 1,
      stationCode: origin.code,
      stationName: origin.name,
      lineCode: origin.lines[0] ?? 'UNKNOWN',
      distanceFromPrevKm: 0,
      travelTimeMinutes: 0,
      action: 'BOARD',
      notes: 'Already at destination station',
    };

    return {
      origin,
      destination,
      path: [initialStep],
      totalDistanceKm: 0,
      totalTravelTimeMinutes: 0,
      interchangeCount: 0,
      interchangeStations: [],
      fareInr: calculateFare(0, fareRules),
    };
  }

  // 3. Dijkstra Data Structures (Trackers)
  const distances = new Map<string, number>();
  const travelTimes = new Map<string, number>();
  const previous = new Map<string, { fromCode: string; edge: GraphEdge }>();
  const unvisited = new Set<string>();

  // Initialize trackers for all stations
  for (const code of graph.stations.keys()) {
    distances.set(code, Infinity);
    travelTimes.set(code, Infinity);
    unvisited.add(code);
  }

  // Origin station se shuruat
  distances.set(originCode, 0);
  travelTimes.set(originCode, 0);

  // 4. Dijkstra Main Loop
  while (unvisited.size > 0) {
    // Sabse kam distance wala unvisited station dhoondho
    let currentCode: string | null = null;
    let smallestDistance = Infinity;

    for (const code of unvisited) {
      const dist = distances.get(code) ?? Infinity;
      if (dist < smallestDistance) {
        smallestDistance = dist;
        currentCode = code;
      }
    }

    // Agar koi reachable station nahi bacha ya destination mil gaya
    if (!currentCode || smallestDistance === Infinity) {
      break;
    }

    if (currentCode === destinationCode) {
      break; // Manzil mil gayi!
    }

    unvisited.delete(currentCode);

    // Is station ke saare outgoing raste (edges) check karo
    const edges = graph.adjacencyList.get(currentCode) ?? [];
    for (const edge of edges) {
      if (!unvisited.has(edge.toStationCode)) {
        continue;
      }

      const currentDist = distances.get(currentCode) ?? 0;
      const newDist = parseFloat((currentDist + edge.distanceKm).toFixed(2));

      if (newDist < (distances.get(edge.toStationCode) ?? Infinity)) {
        distances.set(edge.toStationCode, newDist);
        travelTimes.set(
          edge.toStationCode,
          (travelTimes.get(currentCode) ?? 0) + edge.travelTimeMinutes
        );
        previous.set(edge.toStationCode, { fromCode: currentCode, edge });
      }
    }
  }

  // 5. Agar destination tak koi rasta nahi mila
  if (!previous.has(destinationCode)) {
    return null;
  }

  // 6. Raste ko piche se aage trace karna (Backtracking)
  const hops: Array<{ fromCode: string; toCode: string; edge: GraphEdge }> = [];
  let curr = destinationCode;

  while (curr !== originCode) {
    const prevInfo = previous.get(curr);
    if (!prevInfo) break;
    hops.unshift({ fromCode: prevInfo.fromCode, toCode: curr, edge: prevInfo.edge });
    curr = prevInfo.fromCode;
  }

  // 7. Step-by-Step Directions (RouteSteps) taiyar karna
  const path: RouteStep[] = [];
  const interchangeStations: string[] = [];
  let interchangeCount = 0;

  // Step 1: Boarding step at Origin
  const firstHop = hops[0];
  path.push({
    stepNumber: 1,
    stationCode: origin.code,
    stationName: origin.name,
    lineCode: firstHop.edge.lineCode,
    distanceFromPrevKm: 0,
    travelTimeMinutes: 0,
    action: 'BOARD',
    notes: `Board train towards ${graph.stations.get(firstHop.toCode)?.name ?? firstHop.toCode}`,
  });

  // Intermediate and Alighting Steps
  for (let i = 0; i < hops.length; i++) {
    const hop = hops[i];
    const station = graph.stations.get(hop.toCode)!;
    const isDestination = i === hops.length - 1;
    const nextHop = !isDestination ? hops[i + 1] : null;

    let action: RouteStep['action'] = 'RIDE';
    let notes = `Ride on ${hop.edge.lineCode}`;

    if (isDestination) {
      action = 'ALIGHT';
      notes = `Arrive at destination: ${station.name}`;
    } else if (nextHop && hop.edge.lineCode !== nextHop.edge.lineCode) {
      // Line change detect hui! (Interchange)
      action = 'INTERCHANGE';
      notes = `Transfer to ${nextHop.edge.lineCode}`;
      interchangeCount++;
      interchangeStations.push(station.code);
    }

    path.push({
      stepNumber: path.length + 1,
      stationCode: station.code,
      stationName: station.name,
      lineCode: hop.edge.lineCode,
      distanceFromPrevKm: hop.edge.distanceKm,
      travelTimeMinutes: hop.edge.travelTimeMinutes,
      action,
      notes,
    });
  }

  const totalDistanceKm = parseFloat(
    (distances.get(destinationCode) ?? 0).toFixed(2)
  );
  const totalTravelTimeMinutes = travelTimes.get(destinationCode) ?? 0;
  const fareInr = calculateFare(totalDistanceKm, fareRules);

  return {
    origin,
    destination,
    path,
    totalDistanceKm,
    totalTravelTimeMinutes,
    interchangeCount,
    interchangeStations,
    fareInr,
  };
}
