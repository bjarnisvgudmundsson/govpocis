'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  User,
  Building2,
  DollarSign,
  FileText,
  Tag
} from 'lucide-react';

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

export function ItemDetailsDialog({
  open,
  onOpenChange,
  item
}: ItemDetailsDialogProps) {
  if (!item) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VIRKUR':
        return { backgroundColor: '#28A745', color: 'white' };
      case 'ENDURSKOÐUN':
        return { backgroundColor: '#FFC107', color: 'white' };
      case 'ENDURNÝJUN':
        return { backgroundColor: '#007BFF', color: 'white' };
      case 'Í VANSKILUM':
      case 'VANSKIL':
        return { backgroundColor: '#E03131', color: 'white' };
      case 'Í VINNSLU':
        return { backgroundColor: '#007BFF', color: 'white' };
      case 'VÆNTANLEGT':
        return { backgroundColor: '#6B7280', color: 'white' };
      case 'EINDAGI Í DAG':
        return { backgroundColor: '#FF9800', color: 'white' };
      default:
        return { backgroundColor: '#6B7280', color: 'white' };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{item.title}</DialogTitle>
          <DialogDescription>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase mt-2"
              style={getStatusStyle(item.status)}
            >
              {item.status}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {item.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                LÝSING
              </h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.deadline && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Eindagi</p>
                  <p className="text-sm text-gray-900">{item.deadline}</p>
                </div>
              </div>
            )}

            {item.department && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Deild</p>
                  <p className="text-sm text-gray-900">{item.department}</p>
                </div>
              </div>
            )}

            {item.assignee && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Úthlutað á</p>
                  <p className="text-sm text-gray-900">{item.assignee}</p>
                </div>
              </div>
            )}

            {item.amount && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Upphæð</p>
                  <p className="text-sm text-gray-900">{item.amount}</p>
                </div>
              </div>
            )}

            {item.vendor && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Birgir</p>
                  <p className="text-sm text-gray-900">{item.vendor}</p>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          {item.category && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                FLOKKUR
              </h4>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs border border-slate-200">
                {item.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            LOKA
          </Button>
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            BREYTA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
