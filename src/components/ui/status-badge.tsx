import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Using clean status colors: green for success, red for error/issues, yellow for warnings/pending
  'LOKIÐ': 'bg-success text-success-foreground', // Completed - green
  'PENDING': 'bg-success text-success-foreground', // Pending approval - green
  'VIRKT': 'bg-primary text-primary-foreground', // Active - primary accent
  
  'VANSKIL': 'bg-destructive text-destructive-foreground', // Issues - red
  
  'TIL SKOÐUNAR': 'bg-warning text-warning-foreground', // Under review - yellow
  'EINDAGI Í DAG': 'bg-warning text-warning-foreground', // Due today - yellow
  'DRÖG': 'bg-warning text-warning-foreground', // Draft - yellow
  'Í BIÐ': 'bg-warning text-warning-foreground', // Waiting - yellow
  'Í VINNSLU': 'bg-warning text-warning-foreground', // In progress - yellow
  'Í YFIRLESTRI': 'bg-warning text-warning-foreground', // In review - yellow
  'BÍÐUR SAMÞYKKIS': 'bg-warning text-warning-foreground', // Awaiting approval - yellow
  
  // Neutral states use muted colors
  'VÆNTANLEGT': 'bg-muted text-muted-foreground border border-border', // Expected - muted
  'NÝTT': 'bg-primary text-primary-foreground', // New - primary accent
  'FÆRT Í SKJALASAFN': 'bg-muted text-muted-foreground border border-border', // Archived - muted
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider', // Adjusted padding and tracking for better look
      statusStyles[status.toUpperCase()] || 'bg-muted text-muted-foreground border border-border', // Default to muted, convert status to uppercase for matching
      className
    )}>
      {status}
    </span>
  );
}
