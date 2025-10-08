'use client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function InmateTooltip({children, title, subtitle}:{children:React.ReactNode; title:string; subtitle?:string}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-medium">{title}</div>
          {subtitle && <div className="text-muted-foreground">{subtitle}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
