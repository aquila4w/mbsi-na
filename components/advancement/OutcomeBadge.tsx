'use client';

import { AdvancementOutcome } from '@/lib/advancement/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, OUTCOME_DESCRIPTIONS } from '@/lib/advancement/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OutcomeBadgeProps {
  outcome: AdvancementOutcome;
  showTarget?: string | null;
  className?: string;
}

export function OutcomeBadge({ outcome, showTarget, className = '' }: OutcomeBadgeProps) {
  const colors = OUTCOME_COLORS[outcome];
  const label = OUTCOME_LABELS[outcome];
  const description = OUTCOME_DESCRIPTIONS[outcome];

  const badge = (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border ${className}`}>
      {label}
      {showTarget && outcome !== 'retained' && outcome !== 'suspended' && outcome !== 'expelled' && (
        <span className="ml-1 opacity-75">→ {showTarget}</span>
      )}
    </span>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
