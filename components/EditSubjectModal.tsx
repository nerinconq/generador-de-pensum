
import React, { useState, useEffect } from 'react';
import { Subject, SyllabusItem, Theme, Eje } from '../types';

interface EditSubjectModalProps {
  subject: Subject;
  allEjes: Eje[];
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
  onSave: (updatedSubject: Subject, originalId: string) => void;
  onDelete: (id: string) => void;
}

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({ subject, allEjes, isOpen, theme, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Subject>(subject);

  useEffect(() => {
    setFormData(subject);
  }, [subject]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  // --- Styles ---
  const overlayClass = isDark ? "bg-slate-950/90 backdrop-blur-sm" : "bg-slate-500/50 backdrop-blur-sm";
  const containerClass = isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800";
  const headerClass = isDark ? "bg-indigo-900/50 border-indigo-500/30" : "bg-indigo-50 border-indigo-100";
  const headerTextClass = isDark ? "text-indigo-300" : "text-indigo-700";
  const bodyClass = isDark ? "bg-slate-900" : "bg-white";
  const labelClass = `block text-xs font-bold mb-1 uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  
  const inputClass = `w-full rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors
    ${isDark 
      ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`;

  const cardClass = isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200";

  // --- Handlers ---
  const handleChange = (field: keyof Subject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details!, [field]: value }
    }));
  };

  const handleSyllabusChange = (index: number, field: keyof SyllabusItem, value: string) => {
    const newSyllabus = [...(formData.details?.syllabus || [])];
    newSyllabus[index] = { ...newSyllabus[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details!, syllabus: newSyllabus }
    }));
  };

  const addSyllabusRow = () => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details!,
        syllabus: [...(prev.details?.syllabus || []), { unidad: "", temas: "", objetivos: "", fuentes: "" }]
      }
    }));
  };

  const removeSyllabusRow = (index: number) => {
    const newSyllabus = [...(formData.details?.syllabus || [])];
    newSyllabus.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details!, syllabus: newSyllabus }
    }));
  };

  const handleArrayChange = (field: 'prerrequisitos' | 'correquisitos', value: string) => {
    const array = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 transition-opacity ${overlayClass}`} onClick={onClose}></div>
      
      <div className={`relative rounded-xl shadow-2xl z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border ${containerClass}`}>
        {/* Header */}
        <div className={`p-5 flex justify-between items-center shrink-0 border-b ${headerClass}`}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">MODIFICAR NODO</h2>
            <p className={`text-sm font-mono ${headerTextClass}`}>ID: {subject.id}</p>
          </div>
          <button type="button" onClick={onClose} className={`${headerTextClass} hover:opacity-75 transition-opacity`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={`p-6 overflow-y-auto flex-1 ${bodyClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelClass}>Nombre Asignatura</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Código (ID)</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Semestre</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.semestre}
                onChange={(e) => handleChange('semestre', parseInt(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Eje Temático</label>
              <select
                value={formData.eje}
                onChange={(e) => handleChange('eje', e.target.value)}
                className={inputClass}
              >
                {allEjes.map(opt => (
                  <option key={opt.id} value={opt.nombre}>{opt.nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Prerrequisitos</label>
              <input
                type="text"
                value={formData.prerrequisitos.join(', ')}
                onChange={(e) => handleArrayChange('prerrequisitos', e.target.value)}
                className={inputClass}
                placeholder="ID1, ID2"
              />
            </div>

            <div>
              <label className={labelClass}>Correquisitos</label>
              <input
                type="text"
                value={formData.correquisitos.join(', ')}
                onChange={(e) => handleArrayChange('correquisitos', e.target.value)}
                className={inputClass}
                placeholder="ID3"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Justificación</label>
            <textarea
              rows={4}
              value={formData.details?.justificacion}
              onChange={(e) => handleDetailsChange('justificacion', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
               <h3 className={`text-lg font-bold uppercase ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Configuración de Sílabo</h3>
               <button 
                 type="button"
                 onClick={addSyllabusRow}
                 className="px-3 py-1 bg-emerald-600/10 text-emerald-600 border border-emerald-500 rounded hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
               >
                 + ADD UNIT
               </button>
            </div>
           
            <div className="space-y-4">
              {formData.details?.syllabus.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border relative group ${cardClass}`}>
                  <button 
                    type="button"
                    onClick={() => removeSyllabusRow(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Unidad" 
                      value={item.unidad}
                      onChange={(e) => handleSyllabusChange(idx, 'unidad', e.target.value)}
                      className={`${inputClass} text-sm`}
                    />
                     <input 
                      placeholder="Refs" 
                      value={item.fuentes}
                      onChange={(e) => handleSyllabusChange(idx, 'fuentes', e.target.value)}
                      className={`${inputClass} text-sm`}
                    />
                    <textarea 
                      placeholder="Temas Clave" 
                      value={item.temas}
                      onChange={(e) => handleSyllabusChange(idx, 'temas', e.target.value)}
                      className={`${inputClass} text-sm md:col-span-2`}
                      rows={2}
                    />
                    <textarea 
                      placeholder="Objetivos" 
                      value={item.objetivos}
                      onChange={(e) => handleSyllabusChange(idx, 'objetivos', e.target.value)}
                      className={`${inputClass} text-sm md:col-span-2`}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex justify-between gap-3 shrink-0 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(subject.id); // Pass original ID from props
            }}
            className="px-5 py-2 bg-red-600/10 text-red-500 border border-red-500/50 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            ELIMINAR
          </button>
          
          <div className="flex gap-3">
            <button 
                type="button"
                onClick={onClose}
                className={`px-5 py-2 font-medium rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
                CANCEL
            </button>
            <button 
                type="button"
                onClick={() => onSave(formData, subject.id)}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all flex items-center"
            >
                SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
