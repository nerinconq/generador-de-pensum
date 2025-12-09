
import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { INITIAL_DATA, SUBJECT_DETAILS_MAP, DEFAULT_DETAILS, INITIAL_EJES } from './constants';
import { Subject, HighlightType, Theme, Eje } from './types';
import { SubjectCard } from './components/SubjectCard';
import { ViewSubjectModal } from './components/ViewSubjectModal';
import { EditSubjectModal } from './components/EditSubjectModal';
import { EjeManagerModal } from './components/EjeManagerModal';
import { WelcomeScreen } from './components/WelcomeScreen';

export default function App() {
  // --- State Initialization (with LocalStorage) ---


  const [subjects, setSubjects] = useState<Subject[]>(loadInitialSubjects);

  // Helper to load initial subjects merging with static details if not in storage
  // UPDATED: If no save found, only load first 3 semesters to hide sensitive info
  function loadInitialSubjects(): Subject[] {
    const saved = localStorage.getItem('pensum_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          prerrequisitos: s.prerrequisitos || [],
          correquisitos: s.correquisitos || [],
          eje: s.eje || '',
          details: s.details || DEFAULT_DETAILS
        }));
      } catch (e) {
        console.error("Error parsing saved subjects", e);
      }
    }
    // Fallback: Show only first 3 semesters of initial data
    return INITIAL_DATA.asignaturas
      .filter(s => s.semestre <= 3)
      .map(subj => {
        const details = SUBJECT_DETAILS_MAP[subj.id] || DEFAULT_DETAILS;
        return { ...subj, details };
      });
  }

  const [ejes, setEjes] = useState<Eje[]>(() => {
    const saved = localStorage.getItem('pensum_ejes');
    return saved ? JSON.parse(saved) : INITIAL_EJES;
  });

  const [programInfo, setProgramInfo] = useState<{ name: string, pVersion: string, university: string, email?: string }>(() => {
    const saved = localStorage.getItem('pensum_info');
    return saved ? JSON.parse(saved) : { name: INITIAL_DATA.programa, pVersion: INITIAL_DATA.version, university: 'UMNG' };
  });

  const [hasStarted, setHasStarted] = useState(() => {
    return !!localStorage.getItem('pensum_started');
  });

  const [totalSemesters, setTotalSemesters] = useState(() => {
    const saved = localStorage.getItem('pensum_semesters');
    if (saved) return parseInt(saved);
    // Calculate max semester from initial data, limit to 3 if new
    const maxSem = INITIAL_DATA.asignaturas.reduce((max, s) => Math.max(max, s.semestre), 0);
    // If we have saved data, use it. If not, default to 3 (limited view)
    return localStorage.getItem('pensum_subjects') ? Math.max(maxSem, 10) : 3;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('pensum_theme') as Theme) || 'dark';
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedSubjectId, setDraggedSubjectId] = useState<string | null>(null);

  // Refs
  const boardRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEjeManagerOpen, setIsEjeManagerOpen] = useState(false);

  // Data Menu State
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);

  // --- Persistence Effects ---
  // Save data whenever it changes
  useEffect(() => { localStorage.setItem('pensum_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('pensum_ejes', JSON.stringify(ejes)); }, [ejes]);
  useEffect(() => { localStorage.setItem('pensum_info', JSON.stringify(programInfo)); }, [programInfo]);
  useEffect(() => {
    if (hasStarted) localStorage.setItem('pensum_started', 'true');
  }, [hasStarted]);
  useEffect(() => { localStorage.setItem('pensum_semesters', totalSemesters.toString()); }, [totalSemesters]);
  useEffect(() => { localStorage.setItem('pensum_theme', theme); }, [theme]);


  // --- Logic ---

  const handleCardClick = (id: string) => {
    if (isEditMode) {
      const subj = subjects.find(s => s.id === id);
      if (subj) setEditingSubject(subj);
    } else {
      setActiveSubjectId(prev => (prev === id ? null : id));
    }
  };

  const handleViewDetails = (id: string) => {
    setViewModalId(id);
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSubjectId(id);
    // Set data for HTML5 drag (allows some native browser visual feedback)
    e.dataTransfer.effectAllowed = 'move';
    // Transparent image as ghost if we wanted custom drag image, but default is fine for now
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Necessary to allow dropping
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSemester: number) => {
    e.preventDefault();
    if (!draggedSubjectId) return;

    setSubjects(prev => prev.map(s => {
      if (s.id === draggedSubjectId) {
        return { ...s, semestre: targetSemester };
      }
      return s;
    }));

    setDraggedSubjectId(null);
  };

  // --- Subject CRUD ---

  const handleCreateSubject = (semestre: number) => {
    const tempId = `NEW-${Date.now()}`;
    const newSubject: Subject = {
      id: tempId,
      nombre: 'Nueva Asignatura',
      semestre: semestre,
      eje: ejes[0]?.nombre || '',
      prerrequisitos: [],
      correquisitos: [],
      details: { ...DEFAULT_DETAILS }
    };
    setEditingSubject(newSubject);
  };

  const handleSaveSubject = (updatedSubject: Subject, originalId?: string) => {
    setSubjects(prev => {
      const existingIndex = prev.findIndex(s => s.id === originalId);

      if (existingIndex >= 0) {
        // UPDATE
        const newSubjects = [...prev];
        newSubjects[existingIndex] = updatedSubject;

        // Update references if ID changed
        if (originalId && originalId !== updatedSubject.id) {
          return newSubjects.map(s => ({
            ...s,
            prerrequisitos: s.prerrequisitos.map(p => p === originalId ? updatedSubject.id : p),
            correquisitos: s.correquisitos.map(c => c === originalId ? updatedSubject.id : c)
          }));
        }
        return newSubjects;
      } else {
        // CREATE
        const idCollision = prev.some(s => s.id === updatedSubject.id);
        if (idCollision) {
          alert(`Error: Ya existe una asignatura con el ID "${updatedSubject.id}".`);
          return prev;
        }
        return [...prev, updatedSubject];
      }
    });
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id: string) => {
    console.log('handleDeleteSubject called with id:', id);
    // Check if subject exists in the main list (Saved)
    const exists = subjects.some(s => s.id === id);
    console.log('Subject exists:', exists);

    // If it doesn't exist, it's a "New" subject being discarded from the modal
    if (!exists) {
      setEditingSubject(null);
      return;
    }

    // Check if this subject is a prerequisite or corequisite for other subjects
    const dependentSubjects = subjects.filter(s =>
      (s.prerrequisitos || []).includes(id) || (s.correquisitos || []).includes(id)
    );

    if (dependentSubjects.length > 0) {
      const names = dependentSubjects.map(s => s.nombre).join(', ');
      window.alert(`No se puede eliminar esta asignatura porque es requisito de:\n\n${names}\n\nPrimero debe eliminar o modificar las dependencias.`);
      return;
    }

    // If no dependencies, proceed with deletion
    setSubjects(prev => prev.filter(s => s.id !== id));
    setEditingSubject(null);
  };

  // --- Eje Management (Centralized) ---

  const handleCreateEje = (newEje: Eje) => {
    setEjes(prev => [...prev, newEje]);
  };

  const handleUpdateEje = (updatedEje: Eje, oldName?: string) => {
    setEjes(prev => prev.map(e => e.id === updatedEje.id ? updatedEje : e));

    // Update subjects if the name changed
    if (oldName && updatedEje.nombre !== oldName) {
      setSubjects(prev => prev.map(s => {
        // Use safe trim comparison
        if ((s.eje || '').trim() === oldName.trim()) return { ...s, eje: updatedEje.nombre };
        return s;
      }));
    }
  };

  const handleDeleteEje = (id: string) => {
    const eje = ejes.find(e => e.id === id);
    if (!eje) return;

    // Check if any subjects are using this eje
    const subjectsUsingEje = subjects.filter(s => (s.eje || '').trim() === eje.nombre.trim());

    if (subjectsUsingEje.length > 0) {
      const names = subjectsUsingEje.map(s => s.nombre).join(', ');
      window.alert(`No se puede eliminar el eje "${eje.nombre}" porque está asignado a:\n\n${names}\n\nPrimero debe reasignar o eliminar estas asignaturas.`);
      return;
    }

    // If no subjects use this eje, delete it
    setEjes(prev => prev.filter(e => e.id !== id));
  };

  // --- Semester Management ---

  const handleAddSemester = () => {
    setTotalSemesters(prev => prev + 1);
  };

  const handleDeleteSemester = (e: React.MouseEvent, semNum: number) => {
    e.stopPropagation();
    e.preventDefault();

    const subjectsInSemester = subjects.filter(s => s.semestre === semNum);

    // Block deletion if semester contains subjects
    if (subjectsInSemester.length > 0) {
      const names = subjectsInSemester.map(s => s.nombre).join(', ');
      window.alert(`No se puede eliminar el Semestre ${semNum} porque contiene asignaturas:\n\n${names}\n\nPrimero debe eliminar o mover estas asignaturas.`);
      return;
    }

    // If semester is empty, delete it and reorder
    setTotalSemesters(prev => Math.max(1, prev - 1));
    // Shift subjects from higher semesters down
    setSubjects(prev => prev.map(s => {
      if (s.semestre > semNum) return { ...s, semestre: s.semestre - 1 };
      return s;
    }));
  };

  // --- Reset Data ---
  const handleResetData = () => {
    if (window.confirm("¡ATENCIÓN! Esto borrará todos tus cambios y restaurará el pensum original. ¿Estás seguro?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- Theme & Export ---

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleExportPDF = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);

    try {
      const element = boardRef.current;
      const isDark = theme === 'dark';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? '#020617' : '#f8fafc'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.setFillColor(isDark ? 2 : 248, isDark ? 6 : 250, isDark ? 23 : 252);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('pensum_nanociencia.pdf');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    const dataToExport = {
      subjects,
      ejes,
      programInfo,
      totalSemesters,
      version: "1.0",
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pensum_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        // Basic validation
        if (!importedData.subjects || !importedData.ejes) {
          throw new Error("Formato de archivo inválido: Faltan datos requeridos.");
        }

        if (window.confirm(`¿Estás seguro de cargar este archivo? Esto REEMPLAZARÁ todos los datos actuales con la versión del ${importedData.timestamp || 'archivo'}.`)) {
          // CRITICAL FIX: Ensure state updates trigger re-render and persistence
          setSubjects([...importedData.subjects]);
          setEjes([...importedData.ejes]);

          if (importedData.programInfo) {
            setProgramInfo({ ...importedData.programInfo });
          }

          if (importedData.totalSemesters) {
            setTotalSemesters(importedData.totalSemesters);
          }

          // Force entry if we are on the welcome screen
          if (!hasStarted) {
            setHasStarted(true);
          }

          alert("¡Datos cargados exitosamente!");
        }
      } catch (error) {
        console.error("Error importing JSON:", error);
        alert("Error al leer el archivo. Asegúrate de que sea un JSON válido generado por esta aplicación.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const getHighlightStatus = (subjectId: string): HighlightType => {
    if (!activeSubjectId) return 'none';
    if (activeSubjectId === subjectId) return 'active';

    const activeSubject = subjects.find(s => s.id === activeSubjectId);
    if (!activeSubject) return 'none';

    if (activeSubject.prerrequisitos.includes(subjectId)) return 'prereq';
    if (activeSubject.correquisitos.includes(subjectId)) return 'coreq';

    const thisSubject = subjects.find(s => s.id === subjectId);
    if (thisSubject) {
      if (thisSubject.prerrequisitos.includes(activeSubjectId)) return 'dependent';
      if (thisSubject.correquisitos.includes(activeSubjectId)) return 'dependent';
    }

    return 'none';
  };

  const getEjeForSubject = (subjectEjeName: string): Eje => {
    // Use trim here too for display safety
    const safeName = (subjectEjeName || '').trim();
    return ejes.find(e => e.nombre.trim() === safeName) || { id: 'def', nombre: subjectEjeName, label: '???', color: 'slate' };
  };

  const semesters = useMemo(() => {
    const groups = [];

    // Filter subjects based on Search Query
    const filtered = subjects.filter(s => {
      const q = searchQuery.toLowerCase();
      return s.nombre.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    });

    for (let i = 1; i <= totalSemesters; i++) {
      const semesterSubjects = filtered.filter(s => s.semestre === i);
      // Only show empty semesters if we are in Edit Mode OR if it has subjects
      if (isEditMode || semesterSubjects.length > 0 || i <= 3) {
        groups.push({
          number: i,
          subjects: semesterSubjects
        });
      }
    }
    return groups;
  }, [subjects, totalSemesters, searchQuery, isEditMode]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 4);
  };

  const handleStart = (uni: string, career: string, email: string) => {
    setProgramInfo(prev => ({ ...prev, university: uni, name: career, email: email }));
    setHasStarted(true);
    // Reset logic handled by filtered initial load
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que quieres salir? Se borrarán los datos de sesión local (pero se conservará el avance si no limpias el caché).")) {
      localStorage.removeItem('pensum_started');
      setHasStarted(false);
      window.location.reload();
    }
  };

  if (!hasStarted) {
    return <WelcomeScreen theme={theme} onStart={handleStart} />;
  }

  const selectedViewSubject = subjects.find(s => s.id === viewModalId);
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-500 ${isDark ? 'bg-nano-pattern text-slate-200' : 'bg-engineering-paper text-slate-800'}`}>

      {isDark && (
        <ul className="particles">
          <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
        </ul>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md shadow-lg relative z-30 transition-colors duration-300 ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-gray-200 bg-white/70'}`}>
        <div className="container mx-auto max-w-7xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-md transition-colors ${isDark ? 'bg-indigo-500/20 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-indigo-50 border-indigo-200'}`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight uppercase ${isDark ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-slate-900'}`}>
                {programInfo.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono tracking-wider ${isDark ? 'text-cyan-400' : 'text-indigo-600 font-semibold'}`}>system_ver 1.0</span>
                <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></span>
                <span className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{programInfo.email || 'Guest'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-end">

            {/* Search Bar */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Buscar asignatura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
              />
            </div>

            {isEditMode && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEjeManagerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow-lg shadow-purple-500/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  EJES
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-3 py-1.5 rounded bg-red-600/20 border border-red-500/50 text-red-500 text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                  title="Restaurar valores de fábrica"
                >
                  RESET DATA
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${isDark ? 'border-red-900/30 text-red-400 hover:bg-red-900/20' : 'border-red-100 text-red-600 hover:bg-red-50'}`}
            >
              SALIR
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-orange-500 hover:bg-orange-50'}`}
              title="Toggle Theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`group flex items-center gap-2 px-4 py-2 rounded border transition-all text-sm font-medium
                 ${isDark
                  ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/50 hover:border-cyan-400'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}
               `}
            >
              {isExporting ? <span className="animate-pulse">PROCESSING...</span> : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>EXPORT PDF</span>
                </>
              )}
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

            {/* Data Dropdown - ONLY VISIBLE IN EDIT MODE */}
            {isEditMode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded border transition-all text-sm font-medium ${isDark ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50' : 'border-slate-300 bg-white text-emerald-700 hover:bg-emerald-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  <span>DATA</span>
                  <svg className={`w-3 h-3 transition-transform ${isDataMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isDataMenuOpen && (
                  <div className={`absolute top-full mt-2 right-0 w-48 rounded-lg shadow-xl border overflow-hidden z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <button
                      onClick={() => { handleExportJSON(); setIsDataMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-opacity-50 transition-colors ${isDark ? 'text-gray-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-slate-50'}`}
                    >
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export JSON
                    </button>
                    <button
                      onClick={() => { fileInputRef.current?.click(); setIsDataMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-opacity-50 transition-colors border-t ${isDark ? 'text-gray-200 hover:bg-slate-700 border-slate-700' : 'text-gray-700 hover:bg-slate-50 border-slate-100'}`}
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Import JSON
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              className="hidden"
              accept=".json"
            />

            <div className={`flex items-center gap-3 p-1 rounded-lg border ${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => { setIsEditMode(false); setActiveSubjectId(null); }}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${!isEditMode
                  ? (isDark ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5')
                  : 'text-gray-500 hover:text-gray-400'}`}
              >
                VIEW
              </button>
              <button
                type="button"
                onClick={() => { setIsEditMode(true); setActiveSubjectId(null); }}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${isEditMode
                  ? (isDark ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(219,39,119,0.5)]' : 'bg-white text-pink-700 shadow-sm ring-1 ring-black/5')
                  : 'text-gray-500 hover:text-gray-400'}`}
              >
                EDIT
              </button>
            </div>
          </div>
        </div>
      </header >

      {/* Legend / Status Bar */}
      < div className={`border-b backdrop-blur z-20 transition-colors ${isDark ? 'border-white/5 bg-slate-900/80' : 'border-gray-200 bg-white/80'}`
      }>
        <div className="container mx-auto p-2 flex flex-wrap justify-center gap-6 text-xs font-mono">
          {ejes.map(e => (
            <div key={e.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${e.color}-500 ${isDark ? `shadow-[0_0_8px_var(--color-${e.color}-500)]` : ''}`}></div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{e.nombre.split(':')[0]}</span>
            </div>
          ))}
        </div>
      </div >

      {/* Main Board */}
      < main className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-6 relative z-10" >
        <div ref={boardRef} className="flex space-x-5 min-w-max h-full">
          {semesters.map((sem) => (
            <div
              key={sem.number}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, sem.number)}
              className={`w-[300px] flex flex-col flex-shrink-0 rounded-xl overflow-hidden border backdrop-blur-sm transition-colors ${isDark ? 'border-white/5 bg-slate-900/30' : 'border-slate-200 bg-white/40 shadow-sm'}`}
            >
              {/* Semester Header */}
              <div className={`p-3 border-b flex justify-between items-center group ${isDark ? 'bg-slate-900/60 border-white/5 text-gray-500' : 'bg-slate-100/80 border-slate-200 text-gray-600'}`}>
                <span className="text-xs font-mono font-bold">SEM_0{sem.number}</span>
                <div className="h-1 flex-1 mx-2 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSemester(e, sem.number)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded p-1 transition-colors"
                    title="Eliminar Semestre (Debe estar vacío)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {sem.subjects.map(subject => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    eje={getEjeForSubject(subject.eje)}
                    isActive={!!activeSubjectId}
                    highlightStatus={activeSubjectId ? getHighlightStatus(subject.id) : 'none'}
                    isEditMode={isEditMode}
                    theme={theme}
                    onCardClick={handleCardClick}
                    onViewDetails={handleViewDetails}
                    onDragStart={handleDragStart}
                  />
                ))}

                {/* Add Subject Button (Edit Mode Only) */}
                {isEditMode && !searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleCreateSubject(sem.number)}
                    className={`w-full py-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
                       ${isDark
                        ? 'border-white/10 text-white/30 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-900/20'
                        : 'border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span className="text-[10px] font-bold">ADD SUBJECT</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Semester Column Button */}
          {isEditMode && !searchQuery && (
            <div className={`w-16 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity border-2 border-dashed rounded-xl ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
              <button
                type="button"
                onClick={handleAddSemester}
                className="text-gray-400 hover:text-indigo-500 transform hover:scale-125 transition-transform"
                title="Añadir Semestre"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          )}
        </div>
      </main >

      <footer className={`p-2 text-center text-[10px] font-mono border-t z-20 ${isDark ? 'border-white/5 bg-slate-950/80 text-gray-600' : 'border-gray-200 bg-white/80 text-gray-500'}`}>
        SYS_STATUS: {isEditMode ? 'EDITING_ENABLED' : 'READ_ONLY'} // TECH_CURRICULUM_V1.0 // {getInitials(programInfo.university)}
      </footer>

      {/* Modals */}
      {
        selectedViewSubject && (
          <ViewSubjectModal
            subject={selectedViewSubject}
            isOpen={!!viewModalId}
            theme={theme}
            onClose={() => setViewModalId(null)}
          />
        )
      }

      {
        editingSubject && (
          <EditSubjectModal
            subject={editingSubject}
            allEjes={ejes}
            isOpen={!!editingSubject}
            theme={theme}
            onClose={() => setEditingSubject(null)}
            onSave={handleSaveSubject}
            onDelete={handleDeleteSubject}
          />
        )
      }

      <EjeManagerModal
        ejes={ejes}
        isOpen={isEjeManagerOpen}
        theme={theme}
        onClose={() => setIsEjeManagerOpen(false)}
        onCreate={handleCreateEje}
        onUpdate={handleUpdateEje}
        onDelete={handleDeleteEje}
      />
    </div >
  );
}
