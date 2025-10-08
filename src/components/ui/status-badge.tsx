import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type Status = 'Afgreitt' | 'Óafgreitt' | 'Áríðandi' | string;

const palette: Record<string, string> = {
  'Afgreitt':  'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Óafgreitt': 'bg-amber-100 text-amber-900 border-amber-300',
  'Áríðandi':  'bg-red-100 text-red-800 border-red-300',

  // Legacy status mapping for backwards compatibility
  'LOKIÐ': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'PENDING': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Í VINNSLU': 'bg-amber-100 text-amber-900 border-amber-300',
  'VANSKIL': 'bg-red-100 text-red-800 border-red-300',
  'TIL SKOÐUNAR': 'bg-amber-100 text-amber-900 border-amber-300',
  'DRÖG': 'bg-amber-100 text-amber-900 border-amber-300',
  'Í BIÐ': 'bg-amber-100 text-amber-900 border-amber-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cls = palette[status] ?? 'bg-slate-100 text-slate-700 border-slate-300';
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px]',
      cls,
      className
    )}>
      {status}
    </span>
  );
}
