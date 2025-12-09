
import React, { useState, useEffect } from 'react';
import { Eje, Theme, TailwindColor } from '../types';

interface EjeManagerModalProps {
  ejes: Eje[];
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
  onCreate: (newEje: Eje) => void;
  onUpdate: (eje: Eje, oldName?: string) => void;
  onDelete: (id: string) => void;
}

const COLORS: TailwindColor[] = [
  'slate', 'red', 'orange', 'amber', 'yellow', 'lime', 
  'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

export const EjeManagerModal: React.FC<EjeManagerModalProps> = ({ ejes, isOpen, theme, onClose, onCreate, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEje, setTempEje] = useState<Eje | null>(null);
  const [newEje, setNewEje] = useState<Partial<Eje>>({ nombre: '', label: '', color: 'blue' });

  // Clean state on open
  useEffect(() => {
    if (isOpen) {
      setEditingId(null);
      setTempEje(null);
      setNewEje({ nombre: '', label: '', color: 'blue' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  // --- Styles ---
  const overlayClass = isDark ? "bg-slate-950/90 backdrop-blur-sm" : "bg-slate-500/50 backdrop-blur-sm";
  const containerClass = isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800";
  const headerClass = isDark ? "bg-purple-900/50 border-purple-500/30" : "bg-purple-50 border-purple-100";
  const headerTextClass = isDark ? "text-purple-300" : "text-purple-700";
  const inputClass = `w-full rounded p-2 text-sm border outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`;
  const btnClass = "px-3 py-1 rounded text-xs font-bold transition-colors";
  
  // --- Handlers ---
  
  const startEditing = (eje: Eje) => {
      setEditingId(eje.id);
      setTempEje({ ...eje });
  };

  const handleEditChange = (field: keyof Eje, value: string) => {
      if (tempEje) {
          setTempEje({ ...tempEje, [field]: value });
      }
  };

  const saveEdit = () => {
      if (tempEje) {
          const original = ejes.find(e => e.id === tempEje.id);
          onUpdate(tempEje, original?.nombre);
          setEditingId(null);
          setTempEje(null);
      }
  };

  const handleAdd = () => {
    // Validation: Name is required
    if (!newEje.nombre || newEje.nombre.trim() === '') {
        alert("El nombre del eje es obligatorio.");
        return;
    }

    // Auto-generate label if empty
    const finalLabel = newEje.label && newEje.label.trim() !== '' 
        ? newEje.label 
        : newEje.nombre.substring(0, 3).toUpperCase();

    const newItem: Eje = {
        id: Date.now().toString(),
        nombre: newEje.nombre,
        label: finalLabel,
        color: (newEje.color as TailwindColor) || 'blue'
    };
    
    onCreate(newItem);
    setNewEje({ nombre: '', label: '', color: 'blue' });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 transition-opacity ${overlayClass}`} onClick={onClose}></div>
      <div className={`relative rounded-xl shadow-2xl z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border ${containerClass}`}>
        
        {/* Header */}
        <div className={`p-5 flex justify-between items-center shrink-0 border-b ${headerClass}`}>
          <div>
            <h2 className="text-xl font-bold tracking-tight">GESTIONAR EJES TEMÁTICOS</h2>
            <p className={`text-xs font-mono ${headerTextClass}`}>Define los colores y categorías del pensum.</p>
          </div>
          <button type="button" onClick={onClose} className={`${headerTextClass} hover:opacity-75`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead>
                <tr className={`text-left border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="pb-2 pl-2">Color</th>
                    <th className="pb-2">Nombre Eje</th>
                    <th className="pb-2">Etiqueta (Corto)</th>
                    <th className="pb-2 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
                {ejes.map(eje => {
                    const isEditing = editingId === eje.id && tempEje;
                    return (
                        <tr key={eje.id} className="group">
                            <td className="py-3 pl-2 w-16">
                                {isEditing ? (
                                    <select 
                                        value={tempEje.color} 
                                        onChange={(e) => handleEditChange('color', e.target.value)}
                                        className={`w-12 h-8 rounded cursor-pointer ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                                    >
                                        {COLORS.map(c => <option key={c} value={c} className={`text-${c}-500 bg-slate-900`}>{c}</option>)}
                                    </select>
                                ) : (
                                    <div className={`w-8 h-8 rounded border border-${eje.color}-500 bg-${eje.color}-500/20 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                                )}
                            </td>
                            <td className="py-3 px-2">
                                {isEditing ? (
                                    <input 
                                        value={tempEje.nombre} 
                                        onChange={(e) => handleEditChange('nombre', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <span className="font-medium">{eje.nombre}</span>
                                )}
                            </td>
                            <td className="py-3 px-2 w-32">
                                {isEditing ? (
                                    <input 
                                        value={tempEje.label} 
                                        onChange={(e) => handleEditChange('label', e.target.value)}
                                        className={inputClass}
                                    />
                                ) : (
                                    <span className="font-mono text-xs opacity-70">{eje.label}</span>
                                )}
                            </td>
                            <td className="py-3 px-2 text-right">
                                {isEditing ? (
                                    <button type="button" onClick={saveEdit} className={`${btnClass} bg-green-600 text-white mr-2`}>OK</button>
                                ) : (
                                    // CRITICAL: Removed opacity-0 classes for visibility
                                    <button type="button" onClick={() => startEditing(eje)} className={`${btnClass} bg-blue-600 text-white mr-2`}>EDIT</button>
                                )}
                                <button 
                                    type="button" 
                                    onClick={(e) => handleDelete(e, eje.id)} 
                                    className={`${btnClass} bg-red-600/20 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white`}
                                >
                                    DEL
                                </button>
                            </td>
                        </tr>
                    );
                })}
                
                {/* Add Row */}
                <tr className={`border-t-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <td className="py-4 pl-2">
                        <select 
                            value={newEje.color} 
                            onChange={(e) => setNewEje(p => ({ ...p, color: e.target.value as TailwindColor }))}
                            className={`w-12 h-8 rounded cursor-pointer border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}
                        >
                             {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </td>
                    <td className="py-4 px-2">
                        <input 
                            placeholder="Nombre nuevo eje..."
                            value={newEje.nombre} 
                            onChange={(e) => setNewEje(p => ({ ...p, nombre: e.target.value }))}
                            className={inputClass}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    </td>
                    <td className="py-4 px-2">
                         <input 
                            placeholder="Auto"
                            value={newEje.label} 
                            onChange={(e) => setNewEje(p => ({ ...p, label: e.target.value }))}
                            className={inputClass}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    </td>
                    <td className="py-4 px-2 text-right">
                        <button type="button" onClick={handleAdd} className={`${btnClass} bg-indigo-600 text-white shadow-lg shadow-indigo-500/30`}>+ AÑADIR</button>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
        
        <div className={`p-4 border-t flex justify-end ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white rounded font-bold hover:bg-slate-500">CERRAR</button>
        </div>
      </div>
    </div>
  );
};
