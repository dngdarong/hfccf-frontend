# Sport Module Demo Data Fixtures

This directory contains comprehensive demo data fixtures for the sport module, designed for testing, development, and demonstration purposes.

## Files Overview

### `sportDemoData.js`
The main fixture file containing all demo data exported as JavaScript objects. This file is ideal for:
- Frontend testing with Vitest
- Component testing and mocking
- Development and UI prototyping

**What's included:**
- 4 divisions (U-12, U-15, U-18, Senior)
- 4 playing styles (Tiki-Taka, Counter Attack, Defensive, Attacking)
- 6 teams (mixed divisions)
- 45 players (distributed across teams)
- 2 tournaments (National League, Youth Cup)
- 10 matches (mix of completed and scheduled)
- 8 training sessions
- 8 equipment items
- 6 equipment requests
- 20 attendance records
- 4 match squads
- 6 coach team assignments

## Using the Fixtures

### In Frontend Tests

```javascript
import { sportDemoData, getSportDemoFixture, getDemoItemById } from '@/tests/fixtures/sport/sportDemoData';

describe('Sport Component', () => {
  it('should render teams', () => {
    const teams = sportDemoData.teams;
    expect(teams).toHaveLength(6);
  });

  it('should render players', () => {
    const players = getSportDemoFixture('players');
    expect(players).toHaveLength(45);
  });

  it('should find player by ID', () => {
    const player = getDemoItemById('players', 1);
    expect(player.player_code).toBe('PLY001');
  });
});
```

### In Component Mocks

```javascript
import { createDemoScenario } from '@/tests/fixtures/sport/sportDemoData';

export const mockSportApi = () => {
  const scenario = createDemoScenario();
  
  return {
    teams: vi.fn(() => Promise.resolve(scenario.teams)),
    players: vi.fn(() => Promise.resolve(scenario.players)),
    matches: vi.fn(() => Promise.resolve(scenario.matches)),
    tournaments: vi.fn(() => Promise.resolve(scenario.tournaments)),
  };
};
```

## Data Relationships

The fixtures are structured with logical relationships:

```
Tournament (1)
├── Teams (6 teams registered)
│   ├── Division (U-12, U-15, U-18, Senior)
│   ├── Playing Style (Tiki-Taka, Counter Attack, etc.)
│   ├── Coach (6 coaches assigned)
│   └── Players (45 players total)
├── Matches (10 matches)
│   ├── Match Squads (4 squads for completed matches)
│   └── Match Events (events per match)
└── Training Sessions (8 sessions)

Equipment Management
├── Equipment Items (8 types)
├── Equipment Requests (6 requests)
└── Equipment Assignments (linked to requests)

Attendance
├── Training Records (10 records)
└── Match Records (10 records)
```

## Team Structure

### Senior Division (U-18) - 4 Teams
- **Team 1:** Phnom Penh City FC (8 players)
  - Coach: Kong Sophea
  - Style: Tiki-Taka
  - Venue: Olympic Stadium

- **Team 2:** Sihanoukville United (7 players)
  - Coach: Thay Chandra
  - Style: Counter Attack
  - Venue: Independence Stadium

- **Team 3:** Battambang Tigers (7 players)
  - Coach: Nol Vibol
  - Style: Attacking
  - Venue: Battambang Stadium

- **Team 4:** Kompong Thom Hawks (6 players)
  - Coach: Sok Srey
  - Style: Defensive
  - Venue: Kompong Thom Stadium

### Youth Division (U-15) - 2 Teams
- **Team 5:** Siem Reap Royals (9 players)
  - Coach: Sar Sophea
  - Style: Tiki-Taka
  - Venue: Siem Reap Stadium

- **Team 6:** Preah Sihanouk Mechanics (8 players)
  - Coach: Peng Chamrong
  - Style: Counter Attack
  - Venue: Preah Sihanouk Stadium

## Match Results

Completed matches:
- **MTH001:** PPFC 2-1 Sihanoukville (Winner: PPFC)
- **MTH002:** Battambang 1-1 Kompong Thom (Draw)
- **MTH003:** Siem Reap 3-0 Preah Sihanouk (Winner: Siem Reap)
- **MTH004:** Sihanoukville 0-2 Battambang (Winner: Battambang)
- **MTH005:** Kompong Thom 1-3 PPFC (Winner: PPFC)

Scheduled matches:
- MTH006 - MTH010: Various upcoming matches

## Equipment Overview

### Available Equipment
1. **Footballs** (45/50 available)
2. **Training Cones** (28/30 packs available)
3. **Team Jerseys** (85/100 available)
4. **Training Bibs** (70/80 available)
5. **Shin Guards** (55/60 pairs available)
6. **Goalkeeper Gloves** (20/25 pairs available)
7. **Training Ladders** (8/10 available)
8. **Speed Parachutes** (12/15 available)

### Equipment Requests Status
- 5 approved requests
- 1 pending request

## Attendance Data

### Training Attendance Sample
- Present: 8 records
- Absent: 2 records
- Late: 1 record
- Excused: 1 record

### Match Attendance Sample
- Present: 8 records
- Absent: 1 record

## Tournaments

### National Football League 2026
- **Type:** League
- **Status:** Active
- **Teams:** All 6 teams
- **Season:** 2026
- **Duration:** Feb 15 - Jun 30, 2026
- **Visibility:** Public

### Youth Football Cup 2026
- **Type:** Cup
- **Status:** Draft (preparation phase)
- **Teams:** Youth teams (U-15)
- **Duration:** Apr 15 - May 31, 2026
- **Visibility:** Private

## SQL Alternative

If you need to seed the backend database directly, use the SQL script:
```bash
mysql -u username -p database_name < doc_thesis/sport_demo_data_seeding.sql
```

## Data Characteristics

### Player Names
All names use realistic Cambodian names to match the actual deployment context.

### Age Distribution
- **Senior Division (U-18):** Born 2003-2006
- **Youth Division (U-15):** Born 2009-2011

### Positions
- Forwards (9 players)
- Midfielders (11 players)
- Defenders (20 players)
- Goalkeepers (5 players)

## Extending the Fixtures

To add more demo data:

```javascript
// Add to sportDemoData.js
export const sportDemoData = {
  // ... existing data ...
  customData: [
    // Your custom data here
  ]
};

// Export helper function
export function addCustomData(entity, items) {
  sportDemoData[entity] = [...sportDemoData[entity], ...items];
}
```

## Notes

- All timestamps are in UTC (Z suffix)
- IDs start from 1 and increment sequentially
- Foreign key relationships are maintained (teams → divisions, players → teams, etc.)
- Status values follow the database enum constraints
- The dataset is realistic but fictional for demonstration purposes

## Testing Tips

1. **Isolation:** Create a fresh copy of data in each test to avoid mutations:
   ```javascript
   const teams = JSON.parse(JSON.stringify(sportDemoData.teams));
   ```

2. **Factories:** Use helper functions for flexible test data:
   ```javascript
   function createTeam(overrides = {}) {
     return { ...sportDemoData.teams[0], ...overrides };
   }
   ```

3. **Relationships:** Keep track of IDs when testing related entities
4. **Performance:** Use smaller subsets for unit tests, full dataset for integration tests
