'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { TimelineEvent } from '@/lib/fms/mockPrisonerHistory';

interface TimelineEventSheetProps {
  event: TimelineEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimelineEventSheet({ event, open, onOpenChange }: TimelineEventSheetProps) {
  if (!event) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 ring-1 ring-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
      case 'Low':
      default:
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Atvik: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      Mál: 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
      Skjal: 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200',
      Flutningur: 'bg-teal-100 text-teal-800 ring-1 ring-teal-200',
      Heilsufar: 'bg-green-100 text-green-800 ring-1 ring-green-200',
      Heimsókn: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg">{event.title}</SheetTitle>
          <SheetDescription>
            {new Date(event.ts).toLocaleString('is-IS', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={`text-xs ${getTypeColor(event.type)}`}>{event.type}</Badge>
            <Badge className={`text-xs ${getSeverityColor(event.severity)}`}>
              {event.severity === 'High' ? 'Hátt' : event.severity === 'Medium' ? 'Miðlungs' : 'Lágt'}
            </Badge>
            {event.major && (
              <Badge className="text-xs bg-red-100 text-red-800 ring-1 ring-red-200">Mikilvægt</Badge>
            )}
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-sm font-medium mb-2">Lýsing</h4>
            <p className="text-sm text-muted-foreground">{event.summary}</p>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Merki</h4>
              <div className="flex gap-2 flex-wrap">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-muted rounded-full border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 space-y-2">
            {event.caseId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => alert(`Opna mál: ${event.caseId}`)}
              >
                Opna mál
              </Button>
            )}
            {event.docId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => alert(`Opna skjal: ${event.docId}`)}
              >
                Opna skjal
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
