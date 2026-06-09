export interface StudentMetricsStudent {
  id: string;
  full_name: string;
  date_entered: string | null;
  academics: string;
  spirituality: string;
  jobspec_ministries: string;
  ministerial_proficiency: string;
  character_summary: string;
  achievements_ranking: string;
  faculty_recommendation: string;
  faculty_remarks: string;
  current_level_id: string | null;
  current_status: string;
  graduated_at: string | null;
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
  tithes: number;
  converts: number;
  level_code: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentEvaluation {
  id: string;
  student_id: string;
  evaluation_date: string;
  evaluator_name: string;
  church_assignment: string;
  scope_of_evaluation: string;
  year_level: string;

  // A. Character Development
  char_loyal_respectful: number | null;
  char_adaptable_resilient: number | null;
  char_creative_resourceful: number | null;
  char_empathic_compassionate: number | null;
  char_neat_proper: number | null;
  char_comments: string;

  // B. Spiritual Development
  spirit_biblical_proficiency: number | null;
  spirit_doctrinal_competency: number | null;
  spirit_depth_in_prayer: number | null;
  spirit_soul_winning: number | null;
  spirit_financial_stewardship: number | null;
  spirit_guests: number;
  spirit_baptisms: number;
  spirit_converts_retention: number;
  spirit_thanksgiving_amount: number;
  spirit_caroling_amount: number;
  spirit_evangelism_offering: number;
  spirit_missionary_offering: number;
  spirit_comments: string;

  // C. Work Performance
  work_accountable_responsible: number | null;
  work_productivity_excellence: number | null;
  work_initiative: number | null;
  work_cooperative: number | null;
  work_timely: number | null;
  work_comments: string;

  // D. Skill Development
  skill_leadership: number | null;
  skill_interpersonal: number | null;
  skill_communication: number | null;
  skill_organizational: number | null;
  skill_technical: number | null;
  skill_comments: string;

  // E. Healthy Behaviors
  health_physical: number | null;
  health_emotional: number | null;
  health_mental: number | null;
  health_relational: number | null;
  health_comments: string;

  // F. Misconduct
  misconduct_gross_negligence: boolean;
  misconduct_romantic_relationship: boolean;
  misconduct_laziness: boolean;
  misconduct_tampering_records: boolean;
  misconduct_mishandling_money: boolean;
  misconduct_defiance: boolean;
  misconduct_others: string;
  misconduct_description: string;

  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PastorRecommendation {
  id: string;
  student_id: string;
  pastor_name: string;
  scope_of_evaluation: string;
  year_level: string;
  evaluation_date: string;
  character_description: string;
  offense_committed: string;
  disobedience_patterns: string;
  character_strengths: string;
  jobspec_rating: string;
  jobspec_description: string;
  additional_notes: string;
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
  tithes: number;
  converts: number;
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

export const RATING_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

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
      tithes: acc.tithes + (r.tithes || 0),
      converts: acc.converts + (r.converts || 0),
      total_offering: acc.total_offering + (r.thanksgiving_offering || 0) + (r.evangelism_offering || 0) + (r.tithes || 0),
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
      tithes: 0,
      converts: 0,
      total_offering: 0,
      caroling_goals_reached: 0,
      caroling_total_goal: 0,
      caroling_leader_count: 0,
      years_count: 0,
    }
  );
}

export function computeEvalScore(ev: StudentEvaluation): { total: number; max: number; pct: number; sectionScores: Record<string, number> } {
  const charItems = [ev.char_loyal_respectful, ev.char_adaptable_resilient, ev.char_creative_resourceful, ev.char_empathic_compassionate, ev.char_neat_proper];
  const spiritItems = [ev.spirit_biblical_proficiency, ev.spirit_doctrinal_competency, ev.spirit_depth_in_prayer, ev.spirit_soul_winning, ev.spirit_financial_stewardship];
  const workItems = [ev.work_accountable_responsible, ev.work_productivity_excellence, ev.work_initiative, ev.work_cooperative, ev.work_timely];
  const skillItems = [ev.skill_leadership, ev.skill_interpersonal, ev.skill_communication, ev.skill_organizational, ev.skill_technical];
  const healthItems = [ev.health_physical, ev.health_emotional, ev.health_mental, ev.health_relational];

  const avg = (items: (number | null)[]) => {
    const valid = items.filter((v) => v !== null) as number[];
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  const sectionScores = {
    Character: avg(charItems),
    Spiritual: avg(spiritItems),
    'Work Performance': avg(workItems),
    'Skill Development': avg(skillItems),
    'Healthy Behaviors': avg(healthItems),
  };

  const allItems = [...charItems, ...spiritItems, ...workItems, ...skillItems, ...healthItems];
  const validItems = allItems.filter((v) => v !== null) as number[];
  const total = validItems.reduce((a, b) => a + b, 0);
  const max = validItems.length * 5;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;

  return { total, max, pct, sectionScores };
}
