export interface StudentMetricsStudent {
  id: string;
  full_name: string;
  date_entered: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentMetricsRecord {
  id: string;
  student_id: string;
  year_level: string;
  academic_year: string;
  year: number | null;
  assignment: string;
  contacts: number;
  guests: number;
  baptisms_us: number;
  baptisms_rrb_ph: number;
  thanksgiving_offering: number;
  evangelism_offering: number;
  caroling_goal_reached: boolean;
  caroling_amount: number;
  caroling_leader: boolean;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentWithRecords extends StudentMetricsStudent {
  records: StudentMetricsRecord[];
  totals: StudentTotals;
}

export interface StudentTotals {
  contacts: number;
  guests: number;
  baptisms_us: number;
  baptisms_rrb_ph: number;
  baptisms_total: number;
  thanksgiving_offering: number;
  evangelism_offering: number;
  total_offering: number;
  caroling_goals_reached: number;
  caroling_total_goal: number;
  caroling_leader_count: number;
  years_count: number;
}

export const YEAR_LEVELS = [
  'AMP',
  'AIT',
  'Probationary',
  '1st Year',
  '2nd Year',
  '1st Year Prac',
  '2nd Year Prac',
  '3rd Year',
  '4th Year',
  '2nd Year (Retained)',
  'Other',
];

export function computeTotals(records: StudentMetricsRecord[]): StudentTotals {
  return records.reduce(
    (acc, r) => ({
      contacts: acc.contacts + (r.contacts || 0),
      guests: acc.guests + (r.guests || 0),
      baptisms_us: acc.baptisms_us + (r.baptisms_us || 0),
      baptisms_rrb_ph: acc.baptisms_rrb_ph + (r.baptisms_rrb_ph || 0),
      baptisms_total: acc.baptisms_total + (r.baptisms_us || 0) + (r.baptisms_rrb_ph || 0),
      thanksgiving_offering: acc.thanksgiving_offering + (r.thanksgiving_offering || 0),
      evangelism_offering: acc.evangelism_offering + (r.evangelism_offering || 0),
      total_offering: acc.total_offering + (r.thanksgiving_offering || 0) + (r.evangelism_offering || 0),
      caroling_goals_reached: acc.caroling_goals_reached + (r.caroling_goal_reached ? 1 : 0),
      caroling_total_goal: acc.caroling_total_goal + (r.caroling_amount || 0),
      caroling_leader_count: acc.caroling_leader_count + (r.caroling_leader ? 1 : 0),
      years_count: acc.years_count + 1,
    }),
    {
      contacts: 0,
      guests: 0,
      baptisms_us: 0,
      baptisms_rrb_ph: 0,
      baptisms_total: 0,
      thanksgiving_offering: 0,
      evangelism_offering: 0,
      total_offering: 0,
      caroling_goals_reached: 0,
      caroling_total_goal: 0,
      caroling_leader_count: 0,
      years_count: 0,
    }
  );
}
