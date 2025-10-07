'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { prisonDataService } from '@/lib/prison-data';
import { PrisonerDetailModal } from './prisoner-detail-modal';
import './prison-map.css';

interface InmateProps {
  cellId: string;
  status: 'normal' | 'empty' | 'isolation' | 'medical' | 'watch';
  initials?: string;
  onClick?: () => void;
}

function Inmate({ cellId, status, initials, onClick }: InmateProps) {
  return (
    <span
      className={`inmate status-${status}`}
      onClick={onClick}
      title={`Klef ${cellId} - ${initials || 'Tómt'}`}
    >
      {initials || cellId}
    </span>
  );
}

interface UnitCardProps {
  title: string;
  subtitle?: string;
  footer?: string;
  inmates: string[];
  cellData: Record<string, any>;
  onCellClick: (cellId: string) => void;
  className?: string;
  isSpecialUnit?: boolean;
}

function UnitCard({ title, subtitle, footer, inmates, cellData, onCellClick, className, isSpecialUnit }: UnitCardProps) {
  return (
    <div className={`unit-card ${className || ''}`}>
      <div className="unit-header">
        <div className="unit-title">{title}</div>
        {subtitle && <div className="unit-subtitle">{subtitle}</div>}
      </div>
      <div className={`inmates-grid ${isSpecialUnit ? 'is-2x2' : ''}`}>
        {inmates.map(cellId => (
          <Inmate
            key={cellId}
            cellId={cellId}
            status={cellData[cellId]?.status || 'empty'}
            initials={cellData[cellId]?.initials}
            onClick={() => onCellClick(cellId)}
          />
        ))}
      </div>
      {footer && <div className="unit-footer">{footer}</div>}
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

  // Cell arrays for each unit
  const aAlmaCells = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10'];
  const bAlmaCells = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'B11', 'B12'];
  const cAlmaCells = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
  const einangrunCells = ['E01', 'E02', 'E03', 'E04'];
  const gaesluvardhaldCells = ['G01', 'G02', 'G03', 'G04'];

  return (
    <>
      <div className="prison-map-wrapper">
        {/* Status Legend */}
        <div className="prison-legend">
          <span className="legend-item status-normal">Venjulegt</span>
          <span className="legend-item status-empty">Tómt</span>
          <span className="legend-item status-medical">Læknishjálp</span>
          <span className="legend-item status-watch">Eftirlit</span>
          <span className="legend-item status-isolation">Einangrun</span>
        </div>

        {/* Main Units Grid - A, B, C */}
        <div className="prison-units-grid">
          <UnitCard
            title="A-ÁLMA"
            subtitle="10 klefar • Almennt"
            footer="215 m²"
            inmates={aAlmaCells}
            cellData={cellData}
            onCellClick={handleCellClick}
            className="main-unit"
          />
          <UnitCard
            title="B-ÁLMA"
            subtitle="12 klefar • Almennt"
            footer="285 m²"
            inmates={bAlmaCells}
            cellData={cellData}
            onCellClick={handleCellClick}
            className="main-unit unit-b"
          />
          <UnitCard
            title="C-ÁLMA"
            subtitle="10 klefar • Almennt"
            footer="215 m²"
            inmates={cAlmaCells}
            cellData={cellData}
            onCellClick={handleCellClick}
            className="main-unit"
          />
        </div>

        {/* Special Units - Einangrun and Gæsluvarðhald */}
        <div className="prison-special-units">
          <UnitCard
            title="EINANGRUN"
            subtitle="4 klefar"
            footer="Einarklefa • 95 m²"
            inmates={einangrunCells}
            cellData={cellData}
            onCellClick={handleCellClick}
            className="special-unit"
            isSpecialUnit
          />
          <UnitCard
            title="GÆSLUVARÐHALD"
            subtitle="4 klefar"
            footer="Varðhald • 95 m²"
            inmates={gaesluvardhaldCells}
            cellData={cellData}
            onCellClick={handleCellClick}
            className="special-unit"
            isSpecialUnit
          />
        </div>

        {/* Bottom Caption */}
        <div className="prison-caption">
          <div className="prison-caption-title">FANGELISIÐ HÓLMSHEIÐI</div>
          <div className="prison-caption-subtitle">Grunnmynd 2. hæðar • 1:500</div>
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
