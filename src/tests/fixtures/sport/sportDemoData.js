// Sport Module Demo Data Fixtures
// Generated for medium dataset testing and development

export const sportDemoData = {
  // Divisions
  divisions: [
    {
      id: 1,
      name: 'U-12 Division',
      description: 'Under 12 years old',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'U-15 Division',
      description: 'Under 15 years old',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'U-18 Division',
      description: 'Under 18 years old',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Senior Division',
      description: 'Senior players',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  ],

  // Playing Styles
  playingStyles: [
    {
      id: 1,
      name: 'Tiki-Taka',
      description: 'Possession-based passing game',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Counter Attack',
      description: 'Fast-paced counter-attacking',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Defensive',
      description: 'Defensive-focused strategy',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Attacking',
      description: 'High-pressure attacking',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    }
  ],

  // Teams (6 teams for medium dataset)
  teams: [
    {
      id: 1,
      team_code: 'PHC001',
      name: 'Phnom Penh City FC',
      short_name: 'PPFC',
      division_id: 3,
      playing_style_id: 1,
      coach_user_id: 'coach001',
      coach_display_name: 'Kong Sophea',
      captain_name: 'Som Pich',
      venue: 'Olympic Stadium',
      status: 'active',
      players_count: 25,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 2,
      team_code: 'SIH001',
      name: 'Sihanoukville United',
      short_name: 'SU',
      division_id: 3,
      playing_style_id: 2,
      coach_user_id: 'coach002',
      coach_display_name: 'Thay Chandra',
      captain_name: 'Seah David',
      venue: 'Independence Stadium',
      status: 'active',
      players_count: 24,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 3,
      team_code: 'BT001',
      name: 'Battambang Tigers',
      short_name: 'BT',
      division_id: 3,
      playing_style_id: 4,
      coach_user_id: 'coach003',
      coach_display_name: 'Nol Vibol',
      captain_name: 'Oum Ratanak',
      venue: 'Battambang Stadium',
      status: 'active',
      players_count: 23,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 4,
      team_code: 'KPT001',
      name: 'Kompong Thom Hawks',
      short_name: 'KTH',
      division_id: 3,
      playing_style_id: 3,
      coach_user_id: 'coach004',
      coach_display_name: 'Sok Srey',
      captain_name: 'Chim Rony',
      venue: 'Kompong Thom Stadium',
      status: 'active',
      players_count: 22,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 5,
      team_code: 'SR001',
      name: 'Siem Reap Royals',
      short_name: 'SR',
      division_id: 2,
      playing_style_id: 1,
      coach_user_id: 'coach005',
      coach_display_name: 'Sar Sophea',
      captain_name: 'Tith Dara',
      venue: 'Siem Reap Stadium',
      status: 'active',
      players_count: 20,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 6,
      team_code: 'PM001',
      name: 'Preah Sihanouk Mechanics',
      short_name: 'PSM',
      division_id: 2,
      playing_style_id: 2,
      coach_user_id: 'coach006',
      coach_display_name: 'Peng Chamrong',
      captain_name: 'Ry Piseth',
      venue: 'Preah Sihanouk Stadium',
      status: 'active',
      players_count: 21,
      matches_count: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    }
  ],

  // Players (45 players across teams)
  players: [
    // Team 1: Phnom Penh City FC (8 players)
    { id: 1, player_code: 'PLY001', first_name: 'Som', last_name: 'Pich', team_id: 1, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2005-03-15', current_school: 'High School A', grade_year: '12', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 2, player_code: 'PLY002', first_name: 'Penh', last_name: 'Sokhean', team_id: 1, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2006-06-20', current_school: 'High School B', grade_year: '11', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 3, player_code: 'PLY003', first_name: 'Chea', last_name: 'Visoth', team_id: 1, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2004-01-10', current_school: 'High School C', grade_year: '12', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 4, player_code: 'PLY004', first_name: 'Keo', last_name: 'Sophy', team_id: 1, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2005-08-25', current_school: 'High School D', grade_year: '11', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 5, player_code: 'PLY005', first_name: 'Oum', last_name: 'Bunhak', team_id: 1, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2006-02-14', current_school: 'High School A', grade_year: '10', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 6, player_code: 'PLY006', first_name: 'Pich', last_name: 'Sophea', team_id: 1, jersey_number: 6, position: 'Midfielder', gender: 'M', date_of_birth: '2005-11-03', current_school: 'High School E', grade_year: '11', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 7, player_code: 'PLY007', first_name: 'Thay', last_name: 'Dara', team_id: 1, jersey_number: 3, position: 'Defender', gender: 'M', date_of_birth: '2004-09-18', current_school: 'High School F', grade_year: '12', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 8, player_code: 'PLY008', first_name: 'Nol', last_name: 'Chamrong', team_id: 1, jersey_number: 5, position: 'Defender', gender: 'M', date_of_birth: '2005-05-22', current_school: 'High School G', grade_year: '11', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },

    // Team 2: Sihanoukville United (7 players)
    { id: 9, player_code: 'PLY009', first_name: 'Seah', last_name: 'David', team_id: 2, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2005-07-12', current_school: 'High School H', grade_year: '11', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 10, player_code: 'PLY010', first_name: 'Pun', last_name: 'Kamaera', team_id: 2, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2006-04-08', current_school: 'High School I', grade_year: '10', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 11, player_code: 'PLY011', first_name: 'Seng', last_name: 'Malis', team_id: 2, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2003-12-20', current_school: 'High School J', grade_year: '12', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 12, player_code: 'PLY012', first_name: 'Tith', last_name: 'Rory', team_id: 2, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2005-10-30', current_school: 'High School K', grade_year: '11', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 13, player_code: 'PLY013', first_name: 'Chim', last_name: 'Vannak', team_id: 2, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2006-01-17', current_school: 'High School L', grade_year: '10', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 14, player_code: 'PLY014', first_name: 'Han', last_name: 'Samnang', team_id: 2, jersey_number: 6, position: 'Midfielder', gender: 'M', date_of_birth: '2005-09-05', current_school: 'High School M', grade_year: '11', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 15, player_code: 'PLY015', first_name: 'Hy', last_name: 'Serey', team_id: 2, jersey_number: 3, position: 'Defender', gender: 'M', date_of_birth: '2004-08-28', current_school: 'High School N', grade_year: '12', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },

    // Team 3: Battambang Tigers (7 players)
    { id: 16, player_code: 'PLY016', first_name: 'Oum', last_name: 'Ratanak', team_id: 3, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2005-05-19', current_school: 'High School O', grade_year: '11', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 17, player_code: 'PLY017', first_name: 'Prak', last_name: 'Chenda', team_id: 3, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2006-03-02', current_school: 'High School P', grade_year: '10', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 18, player_code: 'PLY018', first_name: 'Rin', last_name: 'Sreypov', team_id: 3, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2004-02-11', current_school: 'High School Q', grade_year: '12', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 19, player_code: 'PLY019', first_name: 'Sam', last_name: 'Piseth', team_id: 3, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2005-12-07', current_school: 'High School R', grade_year: '11', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 20, player_code: 'PLY020', first_name: 'Rith', last_name: 'Sovann', team_id: 3, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2006-07-21', current_school: 'High School S', grade_year: '10', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 21, player_code: 'PLY021', first_name: 'Phu', last_name: 'Sokhan', team_id: 3, jersey_number: 6, position: 'Midfielder', gender: 'M', date_of_birth: '2005-04-14', current_school: 'High School T', grade_year: '11', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 22, player_code: 'PLY022', first_name: 'Kong', last_name: 'Vichet', team_id: 3, jersey_number: 2, position: 'Defender', gender: 'M', date_of_birth: '2004-11-26', current_school: 'High School U', grade_year: '12', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },

    // Team 4: Kompong Thom Hawks (6 players)
    { id: 23, player_code: 'PLY023', first_name: 'Chim', last_name: 'Rony', team_id: 4, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2005-06-13', current_school: 'High School V', grade_year: '11', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 24, player_code: 'PLY024', first_name: 'Sar', last_name: 'Sompheap', team_id: 4, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2006-08-24', current_school: 'High School W', grade_year: '10', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 25, player_code: 'PLY025', first_name: 'Sok', last_name: 'Dara', team_id: 4, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2003-10-09', current_school: 'High School X', grade_year: '12', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 26, player_code: 'PLY026', first_name: 'Tum', last_name: 'Leakena', team_id: 4, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2005-02-16', current_school: 'High School Y', grade_year: '11', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 27, player_code: 'PLY027', first_name: 'Nav', last_name: 'Channara', team_id: 4, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2006-09-01', current_school: 'High School Z', grade_year: '10', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 28, player_code: 'PLY028', first_name: 'Vin', last_name: 'Pysara', team_id: 4, jersey_number: 5, position: 'Defender', gender: 'M', date_of_birth: '2004-07-31', current_school: 'High School AA', grade_year: '12', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },

    // Team 5: Siem Reap Royals (9 players)
    { id: 29, player_code: 'PLY029', first_name: 'Tith', last_name: 'Dara', team_id: 5, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2010-04-09', current_school: 'School SR1', grade_year: '6', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 30, player_code: 'PLY030', first_name: 'Puth', last_name: 'Sophea', team_id: 5, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2011-02-14', current_school: 'School SR2', grade_year: '5', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 31, player_code: 'PLY031', first_name: 'Vin', last_name: 'Sokhem', team_id: 5, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2009-06-28', current_school: 'School SR3', grade_year: '7', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 32, player_code: 'PLY032', first_name: 'Ry', last_name: 'Sothea', team_id: 5, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2010-11-05', current_school: 'School SR4', grade_year: '6', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 33, player_code: 'PLY033', first_name: 'Phuong', last_name: 'Sophit', team_id: 5, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2011-08-19', current_school: 'School SR5', grade_year: '5', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 34, player_code: 'PLY034', first_name: 'Khom', last_name: 'Pisal', team_id: 5, jersey_number: 6, position: 'Midfielder', gender: 'M', date_of_birth: '2010-01-23', current_school: 'School SR6', grade_year: '6', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 35, player_code: 'PLY035', first_name: 'Som', last_name: 'Theary', team_id: 5, jersey_number: 3, position: 'Defender', gender: 'M', date_of_birth: '2009-12-10', current_school: 'School SR7', grade_year: '7', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 36, player_code: 'PLY036', first_name: 'Nit', last_name: 'Sarun', team_id: 5, jersey_number: 8, position: 'Midfielder', gender: 'M', date_of_birth: '2011-03-30', current_school: 'School SR8', grade_year: '5', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 37, player_code: 'PLY037', first_name: 'Rach', last_name: 'Menha', team_id: 5, jersey_number: 11, position: 'Forward', gender: 'M', date_of_birth: '2011-07-12', current_school: 'School SR9', grade_year: '5', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },

    // Team 6: Preah Sihanouk Mechanics (8 players)
    { id: 38, player_code: 'PLY038', first_name: 'Ry', last_name: 'Piseth', team_id: 6, jersey_number: 10, position: 'Forward', gender: 'M', date_of_birth: '2010-05-16', current_school: 'School PS1', grade_year: '6', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 39, player_code: 'PLY039', first_name: 'Pou', last_name: 'Channy', team_id: 6, jersey_number: 7, position: 'Midfielder', gender: 'M', date_of_birth: '2011-09-22', current_school: 'School PS2', grade_year: '5', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 40, player_code: 'PLY040', first_name: 'Tith', last_name: 'Mony', team_id: 6, jersey_number: 1, position: 'Goalkeeper', gender: 'M', date_of_birth: '2009-03-18', current_school: 'School PS3', grade_year: '7', primary_position: 'Goalkeeper', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 41, player_code: 'PLY041', first_name: 'Nob', last_name: 'Karell', team_id: 6, jersey_number: 4, position: 'Defender', gender: 'M', date_of_birth: '2010-10-04', current_school: 'School PS4', grade_year: '6', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 42, player_code: 'PLY042', first_name: 'Sak', last_name: 'Chantha', team_id: 6, jersey_number: 9, position: 'Forward', gender: 'M', date_of_birth: '2011-04-08', current_school: 'School PS5', grade_year: '5', primary_position: 'Forward', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 43, player_code: 'PLY043', first_name: 'Men', last_name: 'Sophear', team_id: 6, jersey_number: 6, position: 'Midfielder', gender: 'M', date_of_birth: '2010-07-29', current_school: 'School PS6', grade_year: '6', primary_position: 'Midfielder', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 44, player_code: 'PLY044', first_name: 'Tey', last_name: 'Lyheng', team_id: 6, jersey_number: 2, position: 'Defender', gender: 'M', date_of_birth: '2009-08-14', current_school: 'School PS7', grade_year: '7', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
    { id: 45, player_code: 'PLY045', first_name: 'Hing', last_name: 'Vuthy', team_id: 6, jersey_number: 5, position: 'Defender', gender: 'M', date_of_birth: '2010-02-27', current_school: 'School PS8', grade_year: '6', primary_position: 'Defender', status: 'active', approval_status: 'approved', roster_status: 'active', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' }
  ],

  // Tournaments (2 tournaments)
  tournaments: [
    {
      id: 1,
      tournament_code: 'TRNMNT001',
      slug: 'national-league-2026',
      name: 'National Football League 2026',
      season: '2026',
      tournament_type: 'league',
      status: 'active',
      visibility: 'public',
      registration_open_at: '2026-01-01T00:00:00Z',
      registration_close_at: '2026-02-01T00:00:00Z',
      starts_at: '2026-02-15T00:00:00Z',
      ends_at: '2026-06-30T00:00:00Z',
      description: 'National Football League Season 2026',
      location: 'Cambodia',
      organizer: 'Cambodia Football Federation',
      created_by_user_id: 'admin001',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 2,
      tournament_code: 'TRNMNT002',
      slug: 'youth-cup-2026',
      name: 'Youth Football Cup 2026',
      season: '2026',
      tournament_type: 'cup',
      status: 'draft',
      visibility: 'private',
      registration_open_at: '2026-03-01T00:00:00Z',
      registration_close_at: '2026-04-01T00:00:00Z',
      starts_at: '2026-04-15T00:00:00Z',
      ends_at: '2026-05-31T00:00:00Z',
      description: 'Youth Football Cup for U-15 Division',
      location: 'Phnom Penh',
      organizer: 'Youth Sports Department',
      created_by_user_id: 'admin002',
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    }
  ],

  // Matches (10 matches)
  matches: [
    { id: 1, match_code: 'MTH001', home_team_id: 1, away_team_id: 2, tournament_id: 1, scheduled_at: '2026-02-20T15:00:00Z', venue: 'Olympic Stadium', status: 'completed', home_score: 2, away_score: 1, winner_team_id: 1, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T18:00:00Z' },
    { id: 2, match_code: 'MTH002', home_team_id: 3, away_team_id: 4, tournament_id: 1, scheduled_at: '2026-02-21T15:00:00Z', venue: 'Battambang Stadium', status: 'completed', home_score: 1, away_score: 1, winner_team_id: null, created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T18:00:00Z' },
    { id: 3, match_code: 'MTH003', home_team_id: 5, away_team_id: 6, tournament_id: 1, scheduled_at: '2026-02-22T15:00:00Z', venue: 'Siem Reap Stadium', status: 'completed', home_score: 3, away_score: 0, winner_team_id: 5, created_at: '2026-02-22T00:00:00Z', updated_at: '2026-02-22T18:00:00Z' },
    { id: 4, match_code: 'MTH004', home_team_id: 2, away_team_id: 3, tournament_id: 1, scheduled_at: '2026-03-01T15:00:00Z', venue: 'Independence Stadium', status: 'completed', home_score: 0, away_score: 2, winner_team_id: 3, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T18:00:00Z' },
    { id: 5, match_code: 'MTH005', home_team_id: 4, away_team_id: 1, tournament_id: 1, scheduled_at: '2026-03-02T15:00:00Z', venue: 'Kompong Thom Stadium', status: 'completed', home_score: 1, away_score: 3, winner_team_id: 1, created_at: '2026-03-02T00:00:00Z', updated_at: '2026-03-02T18:00:00Z' },
    { id: 6, match_code: 'MTH006', home_team_id: 6, away_team_id: 5, tournament_id: 1, scheduled_at: '2026-03-03T15:00:00Z', venue: 'Preah Sihanouk Stadium', status: 'scheduled', home_score: 0, away_score: 0, created_at: '2026-03-03T00:00:00Z', updated_at: '2026-03-03T00:00:00Z' },
    { id: 7, match_code: 'MTH007', home_team_id: 1, away_team_id: 3, tournament_id: 1, scheduled_at: '2026-03-10T15:00:00Z', venue: 'Olympic Stadium', status: 'scheduled', home_score: 0, away_score: 0, created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
    { id: 8, match_code: 'MTH008', home_team_id: 2, away_team_id: 4, tournament_id: 1, scheduled_at: '2026-03-11T15:00:00Z', venue: 'Independence Stadium', status: 'scheduled', home_score: 0, away_score: 0, created_at: '2026-03-11T00:00:00Z', updated_at: '2026-03-11T00:00:00Z' },
    { id: 9, match_code: 'MTH009', home_team_id: 5, away_team_id: 1, tournament_id: 1, scheduled_at: '2026-03-15T15:00:00Z', venue: 'Siem Reap Stadium', status: 'scheduled', home_score: 0, away_score: 0, created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-15T00:00:00Z' },
    { id: 10, match_code: 'MTH010', home_team_id: 6, away_team_id: 3, tournament_id: 1, scheduled_at: '2026-03-16T15:00:00Z', venue: 'Preah Sihanouk Stadium', status: 'scheduled', home_score: 0, away_score: 0, created_at: '2026-03-16T00:00:00Z', updated_at: '2026-03-16T00:00:00Z' }
  ],

  // Training Sessions (8 sessions)
  trainingSessions: [
    { id: 1, session_code: 'TS001', team_id: 1, coach_user_id: 'coach001', title: 'Technical Skills Training', training_type: 'technical', focus: 'Ball control and passing', venue: 'Olympic Stadium', starts_at: '2026-02-18T14:00:00Z', ends_at: '2026-02-18T16:00:00Z', intensity: 'high', status: 'completed', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T16:30:00Z' },
    { id: 2, session_code: 'TS002', team_id: 1, coach_user_id: 'coach001', title: 'Tactical Formation Drills', training_type: 'tactical', focus: '4-3-3 Formation', venue: 'Olympic Stadium', starts_at: '2026-02-19T14:00:00Z', ends_at: '2026-02-19T16:00:00Z', intensity: 'medium', status: 'completed', created_at: '2026-02-19T00:00:00Z', updated_at: '2026-02-19T16:30:00Z' },
    { id: 3, session_code: 'TS003', team_id: 2, coach_user_id: 'coach002', title: 'Fitness and Conditioning', training_type: 'conditioning', focus: 'Endurance training', venue: 'Independence Stadium', starts_at: '2026-02-20T15:00:00Z', ends_at: '2026-02-20T17:00:00Z', intensity: 'high', status: 'completed', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T17:30:00Z' },
    { id: 4, session_code: 'TS004', team_id: 3, coach_user_id: 'coach003', title: 'Set Piece Practice', training_type: 'technical', focus: 'Corners and Free Kicks', venue: 'Battambang Stadium', starts_at: '2026-02-21T14:00:00Z', ends_at: '2026-02-21T16:00:00Z', intensity: 'medium', status: 'completed', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T16:30:00Z' },
    { id: 5, session_code: 'TS005', team_id: 4, coach_user_id: 'coach004', title: 'Defensive Drills', training_type: 'tactical', focus: 'Man-to-man marking', venue: 'Kompong Thom Stadium', starts_at: '2026-02-23T14:00:00Z', ends_at: '2026-02-23T16:00:00Z', intensity: 'medium', status: 'scheduled', created_at: '2026-02-23T00:00:00Z', updated_at: '2026-02-23T00:00:00Z' },
    { id: 6, session_code: 'TS006', team_id: 5, coach_user_id: 'coach005', title: 'Youth Development Training', training_type: 'technical', focus: 'Basic skills and coordination', venue: 'Siem Reap Stadium', starts_at: '2026-02-24T15:00:00Z', ends_at: '2026-02-24T16:30:00Z', intensity: 'low', status: 'scheduled', created_at: '2026-02-24T00:00:00Z', updated_at: '2026-02-24T00:00:00Z' },
    { id: 7, session_code: 'TS007', team_id: 6, coach_user_id: 'coach006', title: 'Match Preparation', training_type: 'tactical', focus: 'Game strategy review', venue: 'Preah Sihanouk Stadium', starts_at: '2026-02-25T14:00:00Z', ends_at: '2026-02-25T16:00:00Z', intensity: 'medium', status: 'scheduled', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
    { id: 8, session_code: 'TS008', team_id: 1, coach_user_id: 'coach001', title: 'Recovery Session', training_type: 'conditioning', focus: 'Stretching and recovery', venue: 'Olympic Stadium', starts_at: '2026-02-26T16:00:00Z', ends_at: '2026-02-26T17:00:00Z', intensity: 'low', status: 'scheduled', created_at: '2026-02-26T00:00:00Z', updated_at: '2026-02-26T00:00:00Z' }
  ],

  // Equipment Items (8 items)
  equipmentItems: [
    { id: 1, equipment_code: 'EQ001', name: 'Football', category: 'Balls', description: 'Official FIFA Soccer Balls', unit: 'piece', total_quantity: 50, available_quantity: 45, minimum_stock_level: 10, storage_location: 'Storage Room A', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 2, equipment_code: 'EQ002', name: 'Training Cones', category: 'Training Aids', description: 'Multi-color training cones', unit: 'pack', total_quantity: 30, available_quantity: 28, minimum_stock_level: 5, storage_location: 'Storage Room A', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 3, equipment_code: 'EQ003', name: 'Team Jersey', category: 'Apparel', description: 'Standard team jerseys', unit: 'piece', total_quantity: 100, available_quantity: 85, minimum_stock_level: 20, storage_location: 'Storage Room B', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 4, equipment_code: 'EQ004', name: 'Training Bibs', category: 'Apparel', description: 'Reversible training bibs', unit: 'piece', total_quantity: 80, available_quantity: 70, minimum_stock_level: 15, storage_location: 'Storage Room B', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 5, equipment_code: 'EQ005', name: 'Training Shin Guards', category: 'Safety', description: 'Protective shin guards', unit: 'pair', total_quantity: 60, available_quantity: 55, minimum_stock_level: 10, storage_location: 'Storage Room C', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 6, equipment_code: 'EQ006', name: 'Training Gloves', category: 'Apparel', description: 'Goalkeeper training gloves', unit: 'pair', total_quantity: 25, available_quantity: 20, minimum_stock_level: 5, storage_location: 'Storage Room C', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 7, equipment_code: 'EQ007', name: 'Training Ladder', category: 'Training Aids', description: 'Agility training ladder', unit: 'piece', total_quantity: 10, available_quantity: 8, minimum_stock_level: 2, storage_location: 'Storage Room D', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 8, equipment_code: 'EQ008', name: 'Speed Parachute', category: 'Training Aids', description: 'Speed and resistance training parachute', unit: 'piece', total_quantity: 15, available_quantity: 12, minimum_stock_level: 3, storage_location: 'Storage Room D', status: 'active', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' }
  ],

  // Equipment Requests (6 requests)
  equipmentRequests: [
    { id: 1, request_code: 'EQREQ001', equipment_item_id: 1, coach_user_id: 'coach001', team_id: 1, requested_quantity: 10, approved_quantity: 10, status: 'approved', purpose: 'Team training', required_date: '2026-02-20', expected_return_date: '2026-03-20', reviewed_at: '2026-02-15T10:00:00Z', created_at: '2026-02-14T00:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
    { id: 2, request_code: 'EQREQ002', equipment_item_id: 2, coach_user_id: 'coach002', team_id: 2, requested_quantity: 5, approved_quantity: 5, status: 'approved', purpose: 'Cone training drills', required_date: '2026-02-21', expected_return_date: '2026-03-21', reviewed_at: '2026-02-16T10:00:00Z', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-16T10:00:00Z' },
    { id: 3, request_code: 'EQREQ003', equipment_item_id: 3, coach_user_id: 'coach003', team_id: 3, requested_quantity: 20, approved_quantity: 20, status: 'approved', purpose: 'Match uniforms', required_date: '2026-02-25', expected_return_date: '2026-03-25', reviewed_at: '2026-02-17T10:00:00Z', created_at: '2026-02-16T00:00:00Z', updated_at: '2026-02-17T10:00:00Z' },
    { id: 4, request_code: 'EQREQ004', equipment_item_id: 4, coach_user_id: 'coach004', team_id: 4, requested_quantity: 15, approved_quantity: 15, status: 'approved', purpose: 'Training bibs for scrimmage', required_date: '2026-02-28', expected_return_date: '2026-03-28', reviewed_at: '2026-02-18T10:00:00Z', created_at: '2026-02-17T00:00:00Z', updated_at: '2026-02-18T10:00:00Z' },
    { id: 5, request_code: 'EQREQ005', equipment_item_id: 5, coach_user_id: 'coach005', team_id: 5, requested_quantity: 12, approved_quantity: 10, status: 'approved', purpose: 'Youth team protection', required_date: '2026-03-01', expected_return_date: '2026-04-01', reviewed_at: '2026-02-20T10:00:00Z', created_at: '2026-02-19T00:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
    { id: 6, request_code: 'EQREQ006', equipment_item_id: 1, coach_user_id: 'coach006', team_id: 6, requested_quantity: 8, status: 'pending', purpose: 'Youth training', required_date: '2026-03-10', expected_return_date: '2026-04-10', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' }
  ],

  // Attendance Records (20 records across teams)
  attendanceRecords: [
    { id: 1, attendance_type: 'training', subject_key: 'training_1', team_id: 1, player_id: 1, attendance_date: '2026-02-18', status: 'present', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
    { id: 2, attendance_type: 'training', subject_key: 'training_1', team_id: 1, player_id: 2, attendance_date: '2026-02-18', status: 'present', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
    { id: 3, attendance_type: 'training', subject_key: 'training_1', team_id: 1, player_id: 3, attendance_date: '2026-02-18', status: 'absent', note: 'Injury', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
    { id: 4, attendance_type: 'training', subject_key: 'training_1', team_id: 1, player_id: 4, attendance_date: '2026-02-18', status: 'late', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
    { id: 5, attendance_type: 'training', subject_key: 'training_1', team_id: 1, player_id: 5, attendance_date: '2026-02-18', status: 'present', created_at: '2026-02-18T00:00:00Z', updated_at: '2026-02-18T00:00:00Z' },
    { id: 6, attendance_type: 'training', subject_key: 'training_2', team_id: 2, player_id: 9, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 7, attendance_type: 'training', subject_key: 'training_2', team_id: 2, player_id: 10, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 8, attendance_type: 'training', subject_key: 'training_2', team_id: 2, player_id: 11, attendance_date: '2026-02-20', status: 'excused', note: 'Family commitment', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 9, attendance_type: 'training', subject_key: 'training_3', team_id: 3, player_id: 16, attendance_date: '2026-02-21', status: 'present', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 10, attendance_type: 'training', subject_key: 'training_3', team_id: 3, player_id: 17, attendance_date: '2026-02-21', status: 'present', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 11, attendance_type: 'match', subject_key: 'match_1', team_id: 1, player_id: 1, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 12, attendance_type: 'match', subject_key: 'match_1', team_id: 1, player_id: 2, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 13, attendance_type: 'match', subject_key: 'match_1', team_id: 1, player_id: 3, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 14, attendance_type: 'match', subject_key: 'match_1', team_id: 2, player_id: 9, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 15, attendance_type: 'match', subject_key: 'match_1', team_id: 2, player_id: 10, attendance_date: '2026-02-20', status: 'present', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
    { id: 16, attendance_type: 'match', subject_key: 'match_2', team_id: 3, player_id: 16, attendance_date: '2026-02-21', status: 'present', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 17, attendance_type: 'match', subject_key: 'match_2', team_id: 3, player_id: 18, attendance_date: '2026-02-21', status: 'present', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 18, attendance_type: 'match', subject_key: 'match_2', team_id: 4, player_id: 23, attendance_date: '2026-02-21', status: 'present', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 19, attendance_type: 'match', subject_key: 'match_2', team_id: 4, player_id: 25, attendance_date: '2026-02-21', status: 'absent', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T00:00:00Z' },
    { id: 20, attendance_type: 'match', subject_key: 'match_3', team_id: 5, player_id: 29, attendance_date: '2026-02-22', status: 'present', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-02-22T00:00:00Z' }
  ],

  // Match Squads (4 squads for completed matches)
  matchSquads: [
    { id: 1, match_id: 1, team_id: 1, selected_by_user_id: 'coach001', status: 'approved', submitted_at: '2026-02-20T10:00:00Z', approved_at: '2026-02-20T11:00:00Z', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T11:00:00Z' },
    { id: 2, match_id: 1, team_id: 2, selected_by_user_id: 'coach002', status: 'approved', submitted_at: '2026-02-20T10:00:00Z', approved_at: '2026-02-20T11:00:00Z', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T11:00:00Z' },
    { id: 3, match_id: 2, team_id: 3, selected_by_user_id: 'coach003', status: 'approved', submitted_at: '2026-02-21T10:00:00Z', approved_at: '2026-02-21T11:00:00Z', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T11:00:00Z' },
    { id: 4, match_id: 2, team_id: 4, selected_by_user_id: 'coach004', status: 'approved', submitted_at: '2026-02-21T10:00:00Z', approved_at: '2026-02-21T11:00:00Z', created_at: '2026-02-21T00:00:00Z', updated_at: '2026-02-21T11:00:00Z' }
  ],

  // Coach Team Assignments (6 assignments)
  coachTeamAssignments: [
    { id: 1, coach_user_id: 'coach001', team_id: 1, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 2, coach_user_id: 'coach002', team_id: 2, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 3, coach_user_id: 'coach003', team_id: 3, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 4, coach_user_id: 'coach004', team_id: 4, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 5, coach_user_id: 'coach005', team_id: 5, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    { id: 6, coach_user_id: 'coach006', team_id: 6, status: 'active', assigned_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' }
  ]
};

// Helper function to get fixture data
export function getSportDemoFixture(entity) {
  return sportDemoData[entity] || [];
}

// Helper function to get a single item by ID
export function getDemoItemById(entity, id) {
  return sportDemoData[entity]?.find(item => item.id === id);
}

// Helper to create custom fixtures combining multiple entities
export function createDemoScenario() {
  return {
    teams: sportDemoData.teams,
    players: sportDemoData.players,
    divisions: sportDemoData.divisions,
    playingStyles: sportDemoData.playingStyles,
    tournaments: sportDemoData.tournaments,
    matches: sportDemoData.matches,
    trainingSessions: sportDemoData.trainingSessions,
    equipmentItems: sportDemoData.equipmentItems,
    equipmentRequests: sportDemoData.equipmentRequests,
    attendanceRecords: sportDemoData.attendanceRecords,
    matchSquads: sportDemoData.matchSquads,
    coachTeamAssignments: sportDemoData.coachTeamAssignments
  };
}
