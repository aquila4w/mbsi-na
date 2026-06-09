import { AdvancementOutcome, MbsiLevel } from './types';

// Outcome display labels
export const OUTCOME_LABELS: Record<AdvancementOutcome, string> = {
  advanced: 'Advanced',
  conditional_1: 'Conditional (Level 1)',
  conditional_2: 'Conditional (Level 2)',
  retained: 'Retained',
  suspended: 'Suspended',
  expelled: 'Expelled',
  honorable_discharge: 'Honorable Discharge',
  graduated: 'Graduated',
};

// Outcome descriptions for tooltips
export const OUTCOME_DESCRIPTIONS: Record<AdvancementOutcome, string> = {
  advanced: 'Student advances to the next level with no conditions.',
  conditional_1: 'Student advances with minor conditions to be met within a set period. Failure to meet conditions results in retention.',
  conditional_2: 'Student advances with major conditions. Closer monitoring and stricter requirements than Conditional (Level 1).',
  retained: 'Student remains at the current level for another year. Did not meet requirements to advance.',
  suspended: 'Student is temporarily removed from the program. May be reinstated after a review period.',
  expelled: 'Student is permanently removed from the program due to serious violations or failure to meet standards.',
  honorable_discharge: 'Student leaves the program in good standing. May re-enter through the normal enrollment process.',
  graduated: 'Student has completed all program requirements and is eligible for minister promotion.',
};

// Outcome color classes for badges and buttons (same classes used for both)
export const OUTCOME_COLORS: Record<AdvancementOutcome, { bg: string; text: string; border: string }> = {
  advanced: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  conditional_1: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  conditional_2: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  retained: {
    bg: 'bg-orange-200',
    text: 'text-orange-900',
    border: 'border-orange-400',
  },
  suspended: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  expelled: {
    bg: 'bg-red-300',
    text: 'text-red-900',
    border: 'border-red-500',
  },
  honorable_discharge: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  graduated: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
};

// Tier display info
export const TIER_INFO: Record<string, { label: string; color: string }> = {
  amp_internship: { label: 'AMP Internship', color: 'bg-teal-100 text-teal-800' },
  probationary: { label: 'Probationary', color: 'bg-indigo-100 text-indigo-800' },
  mbsi: { label: 'MBSI', color: 'bg-emerald-100 text-emerald-800' },
  terminal: { label: 'Terminal', color: 'bg-gray-100 text-gray-600' },
};

// Session status labels and colors
export const SESSION_STATUS_INFO: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800' },
  finalized: { label: 'Finalized', color: 'bg-amber-100 text-amber-800' },
  applied: { label: 'Applied', color: 'bg-green-100 text-green-800' },
};

// Enrollment status labels and colors
export const ENROLLMENT_STATUS_INFO: Record<string, { label: string; color: string }> = {
  enrolled: { label: 'Enrolled', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  on_leave: { label: 'On Leave', color: 'bg-amber-100 text-amber-800' },
  quit: { label: 'Quit', color: 'bg-gray-100 text-gray-600' },
  graduated: { label: 'Graduated', color: 'bg-purple-100 text-purple-800' },
  expelled: { label: 'Expelled', color: 'bg-red-100 text-red-800' },
  honorable_discharge: { label: 'Honorable Discharge', color: 'bg-gray-100 text-gray-700' },
  minister_promoted: { label: 'Minister', color: 'bg-purple-200 text-purple-900' },
};

// Ordered level codes for dropdowns and display
export const LEVEL_ORDER = [
  'amp_1', 'amp_2',
  'prob_1', 'prob_2',
  'bible_1', 'bible_2',
  'prac_1', 'prac_2',
  'graduated', 'honorable_discharge',
];

// Helper: get sorted levels from DB results
export function sortLevels(levels: MbsiLevel[]): MbsiLevel[] {
  return [...levels].sort((a, b) => {
    if (a.tier_order !== b.tier_order) return a.tier_order - b.tier_order;
    return a.level_order - b.level_order;
  });
}

// Helper: check if an outcome requires conditions text
export function outcomeRequiresConditions(outcome: AdvancementOutcome): boolean {
  return outcome === 'conditional_1' || outcome === 'conditional_2';
}

// Helper: check if outcome changes level
export function outcomeChangesLevel(outcome: AdvancementOutcome): boolean {
  return ['advanced', 'conditional_1', 'conditional_2', 'graduated', 'honorable_discharge'].includes(outcome);
}
