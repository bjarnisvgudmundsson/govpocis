'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { prisonDataService } from '@/lib/prison-data';
import { PrisonerDetailModal } from './prisoner-detail-modal';

interface CellProps {
  cellId: string;
  status: 'normal' | 'empty' | 'isolation' | 'medical' | 'watch';
  initials?: string;
  hasAlert?: boolean;
  className?: string;
  onClick?: () => void;
}

function Cell({ cellId, status, initials, hasAlert, className, onClick }: CellProps) {
  const statusColors = {
    normal: 'bg-green-50 border-green-400 text-green-800',
    empty: 'bg-gray-100 border-gray-300 text-gray-600',
    isolation: 'bg-orange-100 border-orange-600 text-orange-800',
    medical: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    watch: 'bg-red-100 border-red-500 text-red-800'
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'w-12 h-9 border-2 rounded flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 text-xs font-bold shadow-sm',
          statusColors[status],
          hasAlert && status === 'watch' && 'animate-pulse',
          className
        )}
        onClick={onClick}
        title={`Klef ${cellId} - ${initials || 'Tómt'}`}
      >
        <span className="text-[9px] opacity-70">{cellId}</span>
        {initials && (
          <span className="text-[12px] font-bold">{initials}</span>
        )}
      </div>
      {hasAlert && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}

export function PrisonMap() {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Generate cell data from prison service
  const generateCellData = () => {
    const cells: Record<string, any> = {};

    // All possible cells in the prison
    const allCells = [
      // A-álma
      'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
      // B-álma
      'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'B11', 'B12',
      // C-álma
      'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10',
      // Einangrun
      'E01', 'E02', 'E03', 'E04',
      // Gæsluvarðhald
      'G01', 'G02', 'G03', 'G04'
    ];

    // Initialize all cells as empty
    allCells.forEach(cellId => {
      cells[cellId] = {
        status: 'empty' as const,
        initials: null,
        hasAlert: false
      };
    });

    // Fill with prisoner data
    const prisoner = prisonDataService.getPrisonerByCell('A01');
    if (prisoner) {
      cells['A01'] = {
        status: prisoner.status === 'normal' ? 'normal' : prisoner.status,
        initials: prisonDataService.getPrisonerInitials(prisoner.name),
        hasAlert: prisoner.status === 'isolation'
      };
    }

    const prisoner2 = prisonDataService.getPrisonerByCell('A02');
    if (prisoner2) {
      cells['A02'] = {
        status: prisoner2.status === 'normal' ? 'normal' : prisoner2.status,
        initials: prisonDataService.getPrisonerInitials(prisoner2.name),
        hasAlert: false
      };
    }

    const prisoner3 = prisonDataService.getPrisonerByCell('A03');
    if (prisoner3) {
      cells['A03'] = {
        status: prisoner3.status === 'normal' ? 'normal' : prisoner3.status,
        initials: prisonDataService.getPrisonerInitials(prisoner3.name),
        hasAlert: false
      };
    }

    const prisoner4 = prisonDataService.getPrisonerByCell('A04');
    if (prisoner4) {
      cells['A04'] = {
        status: prisoner4.status === 'normal' ? 'normal' : prisoner4.status,
        initials: prisonDataService.getPrisonerInitials(prisoner4.name),
        hasAlert: false
      };
    }

    const prisoner5 = prisonDataService.getPrisonerByCell('A05');
    if (prisoner5) {
      cells['A05'] = {
        status: prisoner5.status === 'normal' ? 'normal' : prisoner5.status,
        initials: prisonDataService.getPrisonerInitials(prisoner5.name),
        hasAlert: false
      };
    }

    // B-álma prisoners
    ['B01', 'B02', 'B03', 'B04', 'B05'].forEach(cellId => {
      const prisoner = prisonDataService.getPrisonerByCell(cellId);
      if (prisoner) {
        cells[cellId] = {
          status: prisoner.status === 'normal' ? 'normal' : prisoner.status,
          initials: prisonDataService.getPrisonerInitials(prisoner.name),
          hasAlert: prisoner.status === 'medical'
        };
      }
    });

    // C-álma prisoners
    ['C01', 'C02', 'C03', 'C04'].forEach(cellId => {
      const prisoner = prisonDataService.getPrisonerByCell(cellId);
      if (prisoner) {
        cells[cellId] = {
          status: prisoner.status === 'normal' ? 'normal' : prisoner.status,
          initials: prisonDataService.getPrisonerInitials(prisoner.name),
          hasAlert: prisoner.status === 'medical'
        };
      }
    });

    // Einangrun prisoners
    ['E01', 'E02'].forEach(cellId => {
      const prisoner = prisonDataService.getPrisonerByCell(cellId);
      if (prisoner) {
        cells[cellId] = {
          status: 'isolation' as const,
          initials: prisonDataService.getPrisonerInitials(prisoner.name),
          hasAlert: true
        };
      }
    });

    // Gæsluvarðhald prisoners
    ['G01', 'G02'].forEach(cellId => {
      const prisoner = prisonDataService.getPrisonerByCell(cellId);
      if (prisoner) {
        cells[cellId] = {
          status: 'isolation' as const,
          initials: prisonDataService.getPrisonerInitials(prisoner.name),
          hasAlert: true
        };
      }
    });

    return cells;
  };

  const cellData = generateCellData();

  const handleCellClick = (cellId: string) => {
    setSelectedCellId(cellId);
    setModalOpen(true);
  };

  return (
    <>
      <div className="h-full w-full p-2 bg-background">
        {/* Status Legend */}
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <Badge className="bg-green-50 text-green-800 border-green-400">Venjulegt</Badge>
          <Badge className="bg-gray-100 text-gray-600 border-gray-300">Tómt</Badge>
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500">Læknishjálp</Badge>
          <Badge className="bg-red-100 text-red-800 border-red-500">Eftirlit</Badge>
          <Badge className="bg-orange-100 text-orange-800 border-orange-600">Einangrun</Badge>
          <Badge className="bg-purple-100 text-purple-800 border-purple-500">Gæsluvarðhald</Badge>
        </div>

        {/* Architectural Floor Plan */}
        <div className="flex-1 relative h-full">
          <svg width="100%" height="100%" viewBox="0 0 800 500" className="border border-border rounded-lg bg-muted/10" preserveAspectRatio="xMidYMid meet">

            {/* Yfirstjórn (Administration) - Top Center */}
            <g>
              <rect x="320" y="20" width="160" height="60" fill="none" stroke="currentColor" strokeWidth="2" rx="4"/>
              <text x="400" y="35" textAnchor="middle" className="text-sm font-semibold">YFIRSTJÓRN</text>
              <text x="400" y="50" textAnchor="middle" className="text-xs">Stjórnun & Skrifstofa</text>
              <text x="400" y="65" textAnchor="middle" className="text-xs text-muted-foreground">Stjórnsýsla</text>
            </g>

            {/* A-álma (Left Wing) */}
            <g>
              <rect x="50" y="95" width="200" height="135" fill="none" stroke="currentColor" strokeWidth="2" rx="4"/>
              <text x="150" y="80" textAnchor="middle" className="text-sm font-semibold">A-ÁLMA</text>
              <text x="150" y="120" textAnchor="middle" className="text-xs">10 klefar • Almennt</text>
              <text x="150" y="210" textAnchor="middle" className="text-xs text-muted-foreground">215 m²</text>
            </g>

            {/* B-álma (Center Wing) */}
            <g>
              <rect x="300" y="95" width="200" height="135" fill="none" stroke="currentColor" strokeWidth="2" rx="4"/>
              <text x="400" y="80" textAnchor="middle" className="text-sm font-semibold">B-ÁLMA</text>
              <text x="400" y="120" textAnchor="middle" className="text-xs">12 klefar • Almennt</text>
              <text x="400" y="210" textAnchor="middle" className="text-xs text-muted-foreground">285 m²</text>
            </g>

            {/* C-álma (Right Wing) */}
            <g>
              <rect x="550" y="95" width="200" height="135" fill="none" stroke="currentColor" strokeWidth="2" rx="4"/>
              <text x="650" y="80" textAnchor="middle" className="text-sm font-semibold">C-ÁLMA</text>
              <text x="650" y="120" textAnchor="middle" className="text-xs">10 klefar • Almennt</text>
              <text x="650" y="210" textAnchor="middle" className="text-xs text-muted-foreground">215 m²</text>
            </g>

            {/* Central Common Areas */}
            <g>
              <rect x="280" y="250" width="100" height="40" fill="none" stroke="currentColor" strokeWidth="1" rx="2"/>
              <text x="330" y="265" textAnchor="middle" className="text-xs">Matsalur</text>
              <text x="330" y="280" textAnchor="middle" className="text-xs text-muted-foreground">Mötuneyti</text>
            </g>

            <g>
              <rect x="390" y="250" width="80" height="40" fill="none" stroke="currentColor" strokeWidth="1" rx="2"/>
              <text x="430" y="265" textAnchor="middle" className="text-xs">Íþróttahús</text>
              <text x="430" y="280" textAnchor="middle" className="text-xs text-muted-foreground">Líkamsrækt</text>
            </g>

            <g>
              <rect x="480" y="250" width="80" height="40" fill="none" stroke="currentColor" strokeWidth="1" rx="2"/>
              <text x="520" y="265" textAnchor="middle" className="text-xs">Vinnustofa</text>
              <text x="520" y="280" textAnchor="middle" className="text-xs text-muted-foreground">Handverk</text>
            </g>

            <g>
              <rect x="570" y="250" width="80" height="40" fill="none" stroke="currentColor" strokeWidth="1" rx="2"/>
              <text x="610" y="265" textAnchor="middle" className="text-xs">Heilsugæsla</text>
              <text x="610" y="280" textAnchor="middle" className="text-xs text-muted-foreground">Læknir</text>
            </g>

            {/* Einangrun (Left Isolation) */}
            <g>
              <rect x="50" y="315" width="160" height="110" fill="none" stroke="#f59e0b" strokeWidth="2" rx="4"/>
              <text x="130" y="300" textAnchor="middle" className="text-sm font-semibold">EINANGRUN</text>
              <text x="130" y="350" textAnchor="middle" className="text-xs">4 klefar</text>
              <text x="130" y="410" textAnchor="middle" className="text-xs text-muted-foreground">Einarklefa • 95 m²</text>
            </g>

            {/* Gæsluvarðhald (Right Detention) */}
            <g>
              <rect x="590" y="315" width="160" height="110" fill="none" stroke="#8b5cf6" strokeWidth="2" rx="4"/>
              <text x="670" y="300" textAnchor="middle" className="text-sm font-semibold">GÆSLUVARÐHALD</text>
              <text x="670" y="350" textAnchor="middle" className="text-xs">4 klefar</text>
              <text x="670" y="410" textAnchor="middle" className="text-xs text-muted-foreground">Varðhald • 95 m²</text>
            </g>

            {/* Prison Title */}
            <text x="400" y="460" textAnchor="middle" className="text-lg font-bold">FANGELISIÐ HÓLMSHEIÐI</text>
            <text x="400" y="480" textAnchor="middle" className="text-xs text-muted-foreground">Grunnmynd 2. hæðar • 1:500</text>
          </svg>

          {/* Interactive Cell Overlays */}

          {/* A-álma Cells (2 rows of 5) - SVG coordinates: x=50, y=95, w=200, h=135 */}
          <div className="absolute" style={{left: '8.5%', top: '25%'}}>
            <div className="grid grid-cols-5 gap-1">
              {['A01', 'A02', 'A03', 'A04', 'A05'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1 mt-1">
              {['A06', 'A07', 'A08', 'A09', 'A10'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
          </div>

          {/* B-álma Cells (2 rows of 6) - SVG coordinates: x=300, y=95, w=200, h=135 */}
          <div className="absolute" style={{left: '39%', top: '25%'}}>
            <div className="grid grid-cols-6 gap-1">
              {['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
            <div className="grid grid-cols-6 gap-1 mt-1">
              {['B07', 'B08', 'B09', 'B10', 'B11', 'B12'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
          </div>

          {/* C-álma Cells (2 rows of 5) - SVG coordinates: x=550, y=95, w=200, h=135 */}
          <div className="absolute" style={{left: '70%', top: '25%'}}>
            <div className="grid grid-cols-5 gap-1">
              {['C01', 'C02', 'C03', 'C04', 'C05'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1 mt-1">
              {['C06', 'C07', 'C08', 'C09', 'C10'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
          </div>

          {/* Einangrun Cells (2x2 grid) - SVG coordinates: x=50, y=315, w=160, h=110 */}
          <div className="absolute" style={{left: '8.5%', top: '70%'}}>
            <div className="grid grid-cols-2 gap-2">
              {['E01', 'E02', 'E03', 'E04'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
          </div>

          {/* Gæsluvarðhald Cells (2x2 grid) - SVG coordinates: x=590, y=315, w=160, h=110 */}
          <div className="absolute" style={{left: '75.5%', top: '70%'}}>
            <div className="grid grid-cols-2 gap-2">
              {['G01', 'G02', 'G03', 'G04'].map(cellId => (
                <Cell
                  key={cellId}
                  cellId={cellId}
                  status={cellData[cellId]?.status || 'empty'}
                  initials={cellData[cellId]?.initials}
                  hasAlert={cellData[cellId]?.hasAlert}
                  onClick={() => handleCellClick(cellId)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Prisoner Detail Modal */}
      <PrisonerDetailModal
        cellId={selectedCellId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}