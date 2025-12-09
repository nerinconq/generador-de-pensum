
import React from 'react';
import { Subject, HighlightType, Theme, Eje } from '../types';

interface SubjectCardProps {
  subject: Subject;
  eje: Eje; // Received from parent based on subject.eje lookup
  highlightStatus: HighlightType;
  isActive: boolean;
  isEditMode: boolean;
  theme: Theme;
  onCardClick: (id: string) => void;
  onViewDetails: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void; // New prop
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  eje,
  highlightStatus, 
  isActive, 
  isEditMode,
  theme,
  onCardClick, 
  onViewDetails,
  onDragStart
}) => {
  const isDark = theme === 'dark';
  const c = eje.color || 'slate';

  // Base Classes
  let cardClasses = `
    relative flex flex-col justify-between 
    rounded-lg transition-all duration-300 group
    min-h-[90px]
  `;
  
  // Add cursor style based on mode
  cardClasses += isEditMode ? ' cursor-move' : ' cursor-pointer';

  // --- DARK MODE STYLING ---
  if (isDark) {
    cardClasses += ` bg-slate-900/80 backdrop-blur-sm border border-${c}-500`;
    
    if (highlightStatus === 'active') {
      cardClasses += ` shadow-[0_0_20px_-5px] shadow-${c}-500/60 scale-105 z-20 ring-1 ring-white/20`;
    } else if (highlightStatus === 'prereq') {
      cardClasses += ` shadow-[0_0_15px_-5px] shadow-red-500/50 border-red-500 bg-red-950/30 z-10`;
    } else if (highlightStatus === 'coreq') {
      cardClasses += ` shadow-[0_0_15px_-5px] shadow-green-500/50 border-green-500 bg-green-950/30 z-10`;
    } else if (highlightStatus === 'dependent') {
      cardClasses += ` shadow-[0_0_15px_-5px] shadow-violet-500/50 border-violet-500 bg-violet-950/30 z-10`;
    } else if (highlightStatus === 'none' && isActive) {
      cardClasses += ` opacity-30 grayscale blur-[1px]`;
    } else {
      cardClasses += ` hover:shadow-[0_0_15px_-5px] hover:shadow-${c}-500/20 hover:translate-y-[-2px] hover:bg-slate-800/90`;
    }
  } 
  // --- LIGHT MODE STYLING ---
  else {
    cardClasses += ` border-t-4 shadow-sm border-l border-r border-b border-gray-200 bg-white border-t-${c}-500`;

    if (highlightStatus === 'active') {
      cardClasses += ` shadow-xl scale-105 z-20 ring-2 ring-indigo-500/50 bg-indigo-50`;
    } else if (highlightStatus === 'prereq') {
      cardClasses += ` bg-red-50 border-red-300 ring-1 ring-red-400`;
    } else if (highlightStatus === 'coreq') {
      cardClasses += ` bg-green-50 border-green-300 ring-1 ring-green-400`;
    } else if (highlightStatus === 'dependent') {
      cardClasses += ` bg-violet-50 border-violet-300 ring-1 ring-violet-400`;
    } else if (highlightStatus === 'none' && isActive) {
      cardClasses += ` opacity-40`;
    } else {
      cardClasses += ` hover:shadow-md hover:translate-y-[-2px]`;
    }
  }

  // Text Colors
  const titleColor = isDark ? 'text-gray-100' : 'text-slate-800';
  const descColor = isDark ? 'text-gray-400' : 'text-slate-500';
  const idColor = isDark ? 'text-slate-500' : 'text-slate-400';
  const iconColor = isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-indigo-600';
  
  const badgeClass = isDark 
    ? `border border-${c}-500 text-${c}-400 bg-slate-950/50` 
    : `bg-slate-100 text-slate-600 border border-slate-200`;

  return (
    <div 
      className={cardClasses}
      draggable={isEditMode}
      onDragStart={(e) => isEditMode && onDragStart && onDragStart(e, subject.id)}
      onClick={() => onCardClick(subject.id)}
    >
      {/* Top Section */}
      <div className="p-3 pb-0 flex justify-between items-start gap-2">
        <h3 className={`font-bold text-sm leading-tight ${titleColor}`}>
          {subject.nombre}
        </h3>
        
        <div className={`
          text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider shrink-0
          ${badgeClass}
        `}>
          {isEditMode ? 'DRAG' : eje.label}
        </div>
      </div>

      {/* Axis/Description */}
      <div className="px-3 pt-2 pb-1">
        <p className={`text-[10px] font-mono leading-tight line-clamp-2 ${descColor}`}>
          {subject.eje}
        </p>
      </div>

      {/* Footer */}
      <div className={`mt-2 px-3 pb-2 pt-1 border-t flex justify-between items-center rounded-b-lg ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
         <span className={`text-[10px] font-mono ${idColor}`}>{subject.id}</span>
         
         <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(subject.id);
            }}
            className={`${iconColor} transition-colors`}
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
         </button>
      </div>
      
      {/* Decorative corners for dark mode active state */}
      {isDark && highlightStatus === 'active' && (
        <>
          <div className={`absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-${c}-500`}></div>
          <div className={`absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-${c}-500`}></div>
        </>
      )}
    </div>
  );
};
