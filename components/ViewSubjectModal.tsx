
import React from 'react';
import { Subject, Theme } from '../types';

interface ViewSubjectModalProps {
  subject: Subject;
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
}

export const ViewSubjectModal: React.FC<ViewSubjectModalProps> = ({ subject, isOpen, theme, onClose }) => {
  if (!isOpen) return null;

  const details = subject.details;
  const isDark = theme === 'dark';

  // Theme Classes
  const overlayClass = isDark ? "bg-slate-950/80 backdrop-blur-sm" : "bg-slate-500/30 backdrop-blur-sm";
  const containerClass = isDark 
    ? "bg-slate-900 border-slate-700 text-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
    : "bg-white border-slate-200 text-slate-800 shadow-2xl";
  
  const headerClass = isDark ? "border-slate-700/50 bg-slate-900" : "border-slate-200 bg-slate-50";
  const titleClass = isDark ? "text-white" : "text-slate-900";
  const badgeClass = isDark ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border-indigo-200";
  const bodyClass = isDark ? "bg-slate-900/50" : "bg-white";
  const subHeaderClass = isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200";
  const textClass = isDark ? "text-slate-300" : "text-slate-700";
  
  const tableHeadClass = isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600";
  const tableBodyClass = isDark ? "bg-slate-900/30 divide-slate-700/30" : "bg-white divide-slate-200";
  const tableRowHoverClass = isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className={`absolute inset-0 transition-opacity ${overlayClass}`} onClick={onClose}></div>
      
      <div className={`relative border rounded-xl z-10 w-full max-w-3xl overflow-y-auto max-h-[90vh] flex flex-col ${containerClass}`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${headerClass}`}>
          <div>
             <h2 className={`text-2xl font-bold tracking-tight ${titleClass}`}>{details?.title || subject.nombre}</h2>
             <div className="flex items-center gap-2 mt-2">
               <span className={`px-2 py-0.5 rounded text-xs font-mono border ${badgeClass}`}>{subject.id}</span>
               <span className="text-sm text-slate-400 font-mono">| {subject.eje}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-indigo-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        {/* Body */}
        <div className={`p-6 overflow-y-auto ${bodyClass}`}>
          <div className="mb-8">
            <h3 className={`text-xs uppercase font-bold mb-2 tracking-widest border-b pb-1 ${subHeaderClass}`}>Justificación</h3>
            <p className={`text-base whitespace-pre-line leading-relaxed font-light ${textClass}`}>
              {details?.justificacion}
            </p>
          </div>
          
          <h3 className={`text-xs uppercase font-bold mb-3 tracking-widest border-b pb-1 ${subHeaderClass}`}>Sílabo Resumido</h3>
          <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <table className={`min-w-full divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
              <thead className={tableHeadClass}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Unidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Temas Clave</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Objetivos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Ref</th>
                </tr>
              </thead>
              <tbody className={`${tableBodyClass} divide-y`}>
                {details?.syllabus && details.syllabus.length > 0 ? (
                  details.syllabus.map((item, idx) => (
                    <tr key={idx} className={`${tableRowHoverClass} transition-colors`}>
                      <td className={`px-4 py-3 text-sm font-medium align-top ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{item.unidad}</td>
                      <td className={`px-4 py-3 text-sm align-top ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.temas}</td>
                      <td className={`px-4 py-3 text-sm align-top ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.objetivos}</td>
                      <td className={`px-4 py-3 text-sm align-top font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.fuentes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No Data Available in Syllabus Database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex gap-4 text-xs font-mono">
             <div className={`px-3 py-2 rounded border flex-1 ${isDark ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <strong className="block text-red-500 mb-1">REQ-PRE:</strong> 
                {subject.prerrequisitos.length > 0 ? subject.prerrequisitos.join(', ') : 'NONE'}
             </div>
             <div className={`px-3 py-2 rounded border flex-1 ${isDark ? 'bg-green-950/30 text-green-400 border-green-900/50' : 'bg-green-50 text-green-700 border-green-100'}`}>
                <strong className="block text-green-500 mb-1">REQ-CO:</strong> 
                {subject.correquisitos.length > 0 ? subject.correquisitos.join(', ') : 'NONE'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
