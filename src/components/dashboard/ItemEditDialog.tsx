'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

export function ItemEditDialog({
  open,
  onOpenChange,
  item
}: ItemEditDialogProps) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    status: item?.status || '',
    description: item?.description || '',
    deadline: item?.deadline || '',
    department: item?.department || '',
    assignee: item?.assignee || '',
    amount: item?.amount || '',
    vendor: item?.vendor || '',
    category: item?.category || ''
  });

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    onOpenChange(false);
  };

  const statusOptions = [
    'VIRKUR',
    'ENDURSKOÐUN',
    'ENDURNÝJUN',
    'Í VANSKILUM',
    'VANSKIL',
    'Í VINNSLU',
    'VÆNTANLEGT',
    'EINDAGI Í DAG'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">BREYTA {item.type.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Breyttu upplýsingum um þetta verk
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">TITILL</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Sláðu inn titil"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">STAÐA</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Veldu stöðu" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">LÝSING</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Sláðu inn lýsingu"
              rows={4}
            />
          </div>

          {/* Grid of fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">EINDAGI</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">DEILD</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Sláðu inn deild"
              />
            </div>

            {/* Assignee */}
            {item.assignee !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="assignee">ÚTHLUTAÐ Á</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Sláðu inn nafn"
                />
              </div>
            )}

            {/* Amount */}
            {item.amount !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="amount">UPPHÆÐ</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Sláðu inn upphæð"
                />
              </div>
            )}

            {/* Vendor */}
            {item.vendor !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="vendor">BIRGIR</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Sláðu inn birgja"
                />
              </div>
            )}

            {/* Category */}
            {item.category !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="category">FLOKKUR</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Sláðu inn flokk"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              HÆTTA VIÐ
            </Button>
            <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800">
              VISTA BREYTINGAR
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
