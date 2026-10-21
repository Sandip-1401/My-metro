import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/ahmedabad_metro';

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

interface StationSeedData {
  code: string;
  name: string;
  gujaratiName?: string;
  hindiName?: string;
  latitude: string;
  longitude: string;
  isInterchange: boolean;
  hasElevator: boolean;
  hasParking: boolean;
}

interface LineStationMapping {
  stationCode: string;
  sequenceOrder: number;
  distanceFromOriginKm: string;
}

// 100% Verified GMRC Ahmedabad Metro Stations (Phase 1 Corridors)
const verifiedStations: StationSeedData[] = [
  // East-West Line Stations
  {
    code: 'THGM',
    name: 'Thaltej Gam',
    gujaratiName: 'થલતેજ ગામ',
    hindiName: 'थलतेज गाँव',
    latitude: '23.0531000',
    longitude: '72.5020000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'THLT',
    name: 'Thaltej',
    gujaratiName: 'થલતેજ',
    hindiName: 'थलतेज',
    latitude: '23.0504000',
    longitude: '72.5165000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'DDKR',
    name: 'Doordarshan Kendra',
    gujaratiName: 'દૂરદર્શન કેન્દ્ર',
    hindiName: 'दूरदर्शन केंद्र',
    latitude: '23.0478000',
    longitude: '72.5298000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'GKRD',
    name: 'Gurukul Road',
    gujaratiName: 'ગુરુકુળ રોડ',
    hindiName: 'गुरुकुल रोड',
    latitude: '23.0461000',
    longitude: '72.5392000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'GUJV',
    name: 'Gujarat University',
    gujaratiName: 'ગુજરાત યુનિવર્સિટી',
    hindiName: 'गुजरात विश्वविद्यालय',
    latitude: '23.0415000',
    longitude: '72.5489000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'CSRD',
    name: 'Commerce Six Road',
    gujaratiName: 'કોમર્સ છ રસ્તા',
    hindiName: 'कॉमर्स सिक्स रोड',
    latitude: '23.0378000',
    longitude: '72.5562000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'SPSD',
    name: 'SP Stadium',
    gujaratiName: 'એસ પી સ્ટેડિયમ',
    hindiName: 'एसपी स्टेडियम',
    latitude: '23.0360000',
    longitude: '72.5651000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  // Interchange Station
  {
    code: 'OHCT',
    name: 'Old High Court',
    gujaratiName: 'જૂની હાઈકોર્ટ',
    hindiName: 'पुराना उच्च न्यायालय',
    latitude: '23.0332000',
    longitude: '72.5714000',
    isInterchange: true,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'SHPR',
    name: 'Shahpur',
    gujaratiName: 'શાહપુર',
    hindiName: 'शाहपुर',
    latitude: '23.0315000',
    longitude: '72.5802000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'GHKN',
    name: 'Gheekanta',
    gujaratiName: 'ઘીકાંટા',
    hindiName: 'घीकांटा',
    latitude: '23.0289000',
    longitude: '72.5878000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'KLPR',
    name: 'Kalupur Railway Station',
    gujaratiName: 'કાલુપુર રેલ્વે સ્ટેશન',
    hindiName: 'कालुपुर रेलवे स्टेशन',
    latitude: '23.0261000',
    longitude: '72.5995000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'KKRE',
    name: 'Kankaria East',
    gujaratiName: 'કાંકરિયા પૂર્વ',
    hindiName: 'कांकरिया पूर्व',
    latitude: '23.0182000',
    longitude: '72.6082000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'APRK',
    name: 'Apparel Park',
    gujaratiName: 'એપરલ પાર્ક',
    hindiName: 'अपैरल पार्क',
    latitude: '23.0125000',
    longitude: '72.6189000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'AMRV',
    name: 'Amraivadi',
    gujaratiName: 'અમરાઇવાડી',
    hindiName: 'अमराईवाडी',
    latitude: '23.0089000',
    longitude: '72.6285000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'RBCL',
    name: 'Rabari Colony',
    gujaratiName: 'રબારી કોલોની',
    hindiName: 'रबारी कॉलोनी',
    latitude: '23.0048000',
    longitude: '72.6391000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'VSTL',
    name: 'Vastral',
    gujaratiName: 'વસ્ત્રાલ',
    hindiName: 'वस्त्राल',
    latitude: '23.0011000',
    longitude: '72.6515000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'NRCR',
    name: 'Nirant Cross Road',
    gujaratiName: 'નિરાંત ક્રોસ રોડ',
    hindiName: 'निरांत क्रॉस रोड',
    latitude: '22.9984000',
    longitude: '72.6612000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'VSGM',
    name: 'Vastral Gam',
    gujaratiName: 'વસ્ત્રાલ ગામ',
    hindiName: 'वस्त्राल गाँव',
    latitude: '22.9958000',
    longitude: '72.6698000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },

  // North-South Line Stations (Excluding OHCT which is already defined)
  {
    code: 'APMC',
    name: 'APMC',
    gujaratiName: 'એ પી એમ સી',
    hindiName: 'एपीएमसी',
    latitude: '22.9865000',
    longitude: '72.5489000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'JVPK',
    name: 'Jivraj Park',
    gujaratiName: 'જીવરાજ પાર્ક',
    hindiName: 'जीवराज पार्क',
    latitude: '22.9982000',
    longitude: '72.5492000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'RJNG',
    name: 'Rajiv Nagar',
    gujaratiName: 'રાજીવ નગર',
    hindiName: 'राजीव नगर',
    latitude: '23.0062000',
    longitude: '72.5510000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'SHRY',
    name: 'Shreyas',
    gujaratiName: 'શ્રેયસ',
    hindiName: 'श्रेयस',
    latitude: '23.0145000',
    longitude: '72.5552000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'PLDI',
    name: 'Paldi',
    gujaratiName: 'પાલડી',
    hindiName: 'पालडी',
    latitude: '23.0195000',
    longitude: '72.5621000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'GDGM',
    name: 'Gandhigram',
    gujaratiName: 'ગાંધીગ્રામ',
    hindiName: 'गांधीग्राम',
    latitude: '23.0268000',
    longitude: '72.5678000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'USMP',
    name: 'Usmanpura',
    gujaratiName: 'ઉસ્માનપુરા',
    hindiName: 'उस्मानपुरा',
    latitude: '23.0421000',
    longitude: '72.5732000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'VJNG',
    name: 'Vijay Nagar',
    gujaratiName: 'વિજય નગર',
    hindiName: 'विजय नगर',
    latitude: '23.0510000',
    longitude: '72.5745000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'VDJH',
    name: 'Vadaj',
    gujaratiName: 'વાડજ',
    hindiName: 'वाडज',
    latitude: '23.0592000',
    longitude: '72.5761000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'RANP',
    name: 'Ranip',
    gujaratiName: 'રાણીપ',
    hindiName: 'राणिप',
    latitude: '23.0691000',
    longitude: '72.5805000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'SBRS',
    name: 'Sabarmati Railway Station',
    gujaratiName: 'સાબરમતી રેલ્વે સ્ટેશન',
    hindiName: 'साबरमती रेलवे स्टेशन',
    latitude: '23.0782000',
    longitude: '72.5849000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
  {
    code: 'AECM',
    name: 'AEC',
    gujaratiName: 'એ ઈ સી',
    hindiName: 'एईसी',
    latitude: '23.0865000',
    longitude: '72.5888000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'SBRM',
    name: 'Sabarmati',
    gujaratiName: 'સાબરમતી',
    hindiName: 'साबरमती',
    latitude: '23.0945000',
    longitude: '72.5930000',
    isInterchange: false,
    hasElevator: true,
    hasParking: false,
  },
  {
    code: 'MTRS',
    name: 'Motera Stadium',
    gujaratiName: 'મોટેરા સ્ટેડિયમ',
    hindiName: 'मोटेरा स्टेडियम',
    latitude: '23.1030000',
    longitude: '72.5975000',
    isInterchange: false,
    hasElevator: true,
    hasParking: true,
  },
];

// Blue Line (East-West) Sequence & Cumulative Distance
const blueLineSequence: LineStationMapping[] = [
  { stationCode: 'THGM', sequenceOrder: 1, distanceFromOriginKm: '0.00' },
  { stationCode: 'THLT', sequenceOrder: 2, distanceFromOriginKm: '1.40' },
  { stationCode: 'DDKR', sequenceOrder: 3, distanceFromOriginKm: '2.80' },
  { stationCode: 'GKRD', sequenceOrder: 4, distanceFromOriginKm: '4.10' },
  { stationCode: 'GUJV', sequenceOrder: 5, distanceFromOriginKm: '5.50' },
  { stationCode: 'CSRD', sequenceOrder: 6, distanceFromOriginKm: '6.60' },
  { stationCode: 'SPSD', sequenceOrder: 7, distanceFromOriginKm: '7.80' },
  { stationCode: 'OHCT', sequenceOrder: 8, distanceFromOriginKm: '8.90' },
  { stationCode: 'SHPR', sequenceOrder: 9, distanceFromOriginKm: '10.40' },
  { stationCode: 'GHKN', sequenceOrder: 10, distanceFromOriginKm: '11.60' },
  { stationCode: 'KLPR', sequenceOrder: 11, distanceFromOriginKm: '13.00' },
  { stationCode: 'KKRE', sequenceOrder: 12, distanceFromOriginKm: '14.80' },
  { stationCode: 'APRK', sequenceOrder: 13, distanceFromOriginKm: '16.20' },
  { stationCode: 'AMRV', sequenceOrder: 14, distanceFromOriginKm: '17.40' },
  { stationCode: 'RBCL', sequenceOrder: 15, distanceFromOriginKm: '18.60' },
  { stationCode: 'VSTL', sequenceOrder: 16, distanceFromOriginKm: '19.80' },
  { stationCode: 'NRCR', sequenceOrder: 17, distanceFromOriginKm: '20.80' },
  { stationCode: 'VSGM', sequenceOrder: 18, distanceFromOriginKm: '21.16' },
];

// Red Line (North-South) Sequence & Cumulative Distance
const redLineSequence: LineStationMapping[] = [
  { stationCode: 'APMC', sequenceOrder: 1, distanceFromOriginKm: '0.00' },
  { stationCode: 'JVPK', sequenceOrder: 2, distanceFromOriginKm: '1.70' },
  { stationCode: 'RJNG', sequenceOrder: 3, distanceFromOriginKm: '2.80' },
  { stationCode: 'SHRY', sequenceOrder: 4, distanceFromOriginKm: '4.10' },
  { stationCode: 'PLDI', sequenceOrder: 5, distanceFromOriginKm: '5.50' },
  { stationCode: 'GDGM', sequenceOrder: 6, distanceFromOriginKm: '6.70' },
  { stationCode: 'OHCT', sequenceOrder: 7, distanceFromOriginKm: '7.80' },
  { stationCode: 'USMP', sequenceOrder: 8, distanceFromOriginKm: '9.10' },
  { stationCode: 'VJNG', sequenceOrder: 9, distanceFromOriginKm: '10.30' },
  { stationCode: 'VDJH', sequenceOrder: 10, distanceFromOriginKm: '11.40' },
  { stationCode: 'RANP', sequenceOrder: 11, distanceFromOriginKm: '12.80' },
  { stationCode: 'SBRS', sequenceOrder: 12, distanceFromOriginKm: '14.00' },
  { stationCode: 'AECM', sequenceOrder: 13, distanceFromOriginKm: '15.20' },
  { stationCode: 'SBRM', sequenceOrder: 14, distanceFromOriginKm: '16.40' },
  { stationCode: 'MTRS', sequenceOrder: 15, distanceFromOriginKm: '18.87' },
];

// Official Fare Slabs (GMRC Ahmedabad Metro)
const officialFareRules = [
  { minDistanceKm: '0.00', maxDistanceKm: '2.00', fareInr: 5, description: 'Up to 2 km' },
  { minDistanceKm: '2.01', maxDistanceKm: '5.00', fareInr: 10, description: '2 to 5 km' },
  { minDistanceKm: '5.01', maxDistanceKm: '8.00', fareInr: 15, description: '5 to 8 km' },
  { minDistanceKm: '8.01', maxDistanceKm: '12.00', fareInr: 20, description: '8 to 12 km' },
  { minDistanceKm: '12.01', maxDistanceKm: null, fareInr: 25, description: 'Above 12 km' },
];

async function seed() {
  console.log('🌱 Starting Ahmedabad Metro database seed...');

  try {
    // 1. Seed Metro Lines
    console.log('1. Seeding Metro Lines...');
    const linesToInsert = [
      {
        code: 'BLUE_LINE',
        name: 'East-West Corridor',
        displayName: 'Blue Line',
        color: '#2563eb',
      },
      {
        code: 'RED_LINE',
        name: 'North-South Corridor',
        displayName: 'Red Line',
        color: '#dc2626',
      },
    ];

    const insertedLines: Record<string, string> = {};
    for (const line of linesToInsert) {
      const [existing] = await db
        .select()
        .from(schema.metroLines)
        .where(eq(schema.metroLines.code, line.code));

      if (existing) {
        insertedLines[line.code] = existing.id;
      } else {
        const [created] = await db
          .insert(schema.metroLines)
          .values(line)
          .returning({ id: schema.metroLines.id });
        insertedLines[line.code] = created.id;
      }
    }

    // 2. Seed Stations (Unique physical records)
    console.log(`2. Seeding ${verifiedStations.length} Stations...`);
    const stationIdMap: Record<string, string> = {};

    for (const stationData of verifiedStations) {
      const [existing] = await db
        .select()
        .from(schema.stations)
        .where(eq(schema.stations.code, stationData.code));

      if (existing) {
        stationIdMap[stationData.code] = existing.id;
      } else {
        const [created] = await db
          .insert(schema.stations)
          .values(stationData)
          .returning({ id: schema.stations.id });
        stationIdMap[stationData.code] = created.id;
      }
    }

    // 3. Seed Station Line Mappings
    console.log('3. Seeding Station-Line memberships & sequence...');
    const seedLineSequence = async (lineCode: string, sequence: LineStationMapping[]) => {
      const lineId = insertedLines[lineCode];
      for (const item of sequence) {
        const stationId = stationIdMap[item.stationCode];
        if (!stationId) continue;

        // Upsert station-line entry
        await db
          .insert(schema.stationLines)
          .values({
            stationId,
            lineId,
            sequenceOrder: item.sequenceOrder,
            distanceFromOriginKm: item.distanceFromOriginKm,
          })
          .onConflictDoNothing();
      }
    };

    await seedLineSequence('BLUE_LINE', blueLineSequence);
    await seedLineSequence('RED_LINE', redLineSequence);

    // 4. Seed Station Connections (Graph Edges for Route Planner)
    console.log('4. Generating graph connections (edges)...');
    const generateConnections = async (lineCode: string, sequence: LineStationMapping[]) => {
      const lineId = insertedLines[lineCode];
      for (let i = 0; i < sequence.length - 1; i++) {
        const current = sequence[i];
        const next = sequence[i + 1];

        const fromStationId = stationIdMap[current.stationCode];
        const toStationId = stationIdMap[next.stationCode];
        const distKm = (
          parseFloat(next.distanceFromOriginKm) - parseFloat(current.distanceFromOriginKm)
        ).toFixed(2);
        // Average speed ~35 km/h + station dwell time ~30s => ~2 min per hop
        const travelTimeMinutes = 2;

        // Bidirectional edges
        await db
          .insert(schema.stationConnections)
          .values([
            {
              fromStationId,
              toStationId,
              lineId,
              distanceKm: distKm,
              travelTimeMinutes,
            },
            {
              fromStationId: toStationId,
              toStationId: fromStationId,
              lineId,
              distanceKm: distKm,
              travelTimeMinutes,
            },
          ])
          .onConflictDoNothing();
      }
    };

    await generateConnections('BLUE_LINE', blueLineSequence);
    await generateConnections('RED_LINE', redLineSequence);

    // 5. Seed Fare Rules
    console.log('5. Seeding official fare rules...');
    for (const rule of officialFareRules) {
      await db
        .insert(schema.fareRules)
        .values(rule)
        .onConflictDoNothing();
    }

    console.log('✅ Ahmedabad Metro database seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
