
export interface SyllabusItem {
  unidad: string;
  temas: string;
  objetivos: string;
  fuentes: string;
}

export interface SubjectDetails {
  title?: string;
  justificacion: string;
  syllabus: SyllabusItem[];
}

export interface Subject {
  id: string;
  nombre: string;
  semestre: number;
  eje: string; // This links to Eje.nombre
  prerrequisitos: string[];
  correquisitos: string[];
  details?: SubjectDetails;
}

export interface ProgramData {
  programa: string;
  version: string;
  asignaturas: Subject[];
}

export type HighlightType = 'active' | 'prereq' | 'coreq' | 'dependent' | 'none';

export type Theme = 'light' | 'dark';

// Available colors for the UI logic
export type TailwindColor = 
  | 'slate' | 'gray' | 'red' | 'orange' | 'amber' | 'yellow' 
  | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' 
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export interface Eje {
  id: string; // Unique ID for internal tracking if needed, though we link by name currently
  nombre: string; // The display name "Básico (Física y Mat)"
  label: string; // Short code "BAS"
  color: TailwindColor; // The color theme
}
