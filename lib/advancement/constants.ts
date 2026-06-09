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

// Outcome color classes for badges and buttons
export const OUTCOME_COLORS: Record<AdvancementOutcome, { bg: string; text: string; border: string; btn: string }> = {
  advanced: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    btn: 'bg-green-600 hover:bg-green-700 text-white',
  },
  conditional_1: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  conditional_2: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  retained: {
    bg: 'bg-orange-200',
    text: 'text-orange-900',
    border: 'border-orange-400',
    btn: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  suspended: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    btn: 'bg-red-600 hover:bg-red-700 text-white',
  },
  expelled: {
    bg: 'bg-red-300',
    text: 'text-red-900',
    border: 'border-red-500',
    btn: 'bg-red-800 hover:bg-red-900 text-white',
  },
  honorable_discharge: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    btn: 'bg-gray-500 hover:bg-gray-600 text-white',
  },
  graduated: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
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
