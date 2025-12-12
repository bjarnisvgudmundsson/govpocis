'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import { ExternalSummaryData, formatExternalSummaryText } from '@/lib/fms/externalSummary';

interface ExternalSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summaryData: ExternalSummaryData | null;
}

export function ExternalSummaryDialog({
  open,
  onOpenChange,
  summaryData,
}: ExternalSummaryDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!summaryData) return null;

  const summaryText = formatExternalSummaryText(summaryData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Samantekt fyrir ytri aðila</DialogTitle>
          <DialogDescription>
            Hrein samantekt án innri upplýsinga - tilbúin til afhendingar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Preview */}
          <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/30 p-4">
            <div className="space-y-6 font-mono text-sm">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">SAMANTEKT FYRIR YTRI AÐILA</h2>
                <p className="text-xs text-muted-foreground mt-2">
                  Dagsetning: {summaryData.summaryDate}
                </p>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="font-bold text-xs uppercase text-muted-foreground mb-2 border-b pb-1">
                  Grunnupplýsingar
                </h3>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-semibold">Nafn:</span> {summaryData.prisonerName}
                  </div>
                  <div>
                    <span className="font-semibold">Fanganúmer:</span> {summaryData.prisonerNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Stofnun:</span> {summaryData.facility}
                  </div>
                  <div>
                    <span className="font-semibold">Staða:</span> {summaryData.custodyStatus}
                  </div>
                </div>
              </div>

              {/* Legal Status */}
              <div>
                <h3 className="font-bold text-xs uppercase text-muted-foreground mb-2 border-b pb-1">
                  Lögfræðileg staða
                </h3>
                <p className="text-xs leading-relaxed">{summaryData.legalStatus}</p>
              </div>

              {/* Timeline Summary */}
              <div>
                <h3 className="font-bold text-xs uppercase text-muted-foreground mb-2 border-b pb-1">
                  Tímalína - Helstu atriði
                </h3>
                {summaryData.timelineSummary.length > 0 ? (
                  <ul className="space-y-1.5">
                    {summaryData.timelineSummary.map((item, idx) => (
                      <li key={idx} className="text-xs flex gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Engin veruleg atvik skráð á tímabilinu.
                  </p>
                )}
              </div>

              {/* Measures */}
              <div>
                <h3 className="font-bold text-xs uppercase text-muted-foreground mb-2 border-b pb-1">
                  Áætlun og ráðstafanir
                </h3>
                <ul className="space-y-1.5">
                  {summaryData.measures.map((measure, idx) => (
                    <li key={idx} className="text-xs flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  Þessi samantekt er ætluð til afhendingar til ytri aðila
                  <br />
                  og inniheldur einungis nauðsynlegar upplýsingar.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Útbúið af: Fangelsismálastofnun Íslands
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-xs text-blue-900">
              <strong>Athugið:</strong> Þessi samantekt inniheldur ekki innri athugasemdir,
              nöfn starfsmanna eða viðkvæmar upplýsingar. Hún er tilbúin til afhendingar
              til lögmanna, dómstóla eða annarra ytri aðila.
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Loka
          </Button>
          <Button onClick={handleCopy} disabled={copied}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Afritað
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Afrita
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
