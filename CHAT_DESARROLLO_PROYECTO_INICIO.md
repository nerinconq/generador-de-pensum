# Chat Desarrollo de Proyecto - INICIO

## Resumen del Proyecto
**Proyecto**: Gestor de Pensum de Carrera - Editor de Currículos Académicos
**Fecha**: 8 de diciembre de 2024
**Objetivo**: Transformar un gestor de pensum existente en un editor de carreras con autenticación y funcionalidades mejoradas

## Contexto Inicial
El usuario tenía un proyecto de gestor de pensum para la carrera de "Física para la Nanociencia y el Hardware" de la UMNG. Necesitaba:
1. Reparar botones de eliminación que no funcionaban
2. Implementar una pantalla de bienvenida con autenticación
3. Rebrandear la aplicación como "Editor de Carreras"
4. Limitar la vista inicial a 3 semestres

## Problemas Identificados y Solucionados

### 1. Botones de Eliminación No Funcionaban
**Problema**: Los tres botones de eliminar (Semestre, Asignatura, Eje) no respondían.

**Causa Raíz**: `window.confirm` estaba siendo bloqueado por el navegador, causando que retornara `false` inmediatamente sin mostrar el diálogo.

**Solución Implementada**:
- Reemplazar `window.confirm` con `window.alert` para mensajes de error
- Implementar lógica de **bloqueo estricto** en lugar de confirmación:
  - **Asignaturas**: Solo se eliminan si NO son prerrequisito/correquisito de otras
  - **Ejes Temáticos**: Solo se eliminan si NO tienen asignaturas asociadas
  - **Semestres**: Solo se eliminan si están vacíos (sin asignaturas)

**Archivos Modificados**:
- `App.tsx`: Funciones `handleDeleteSubject`, `handleDeleteEje`, `handleDeleteSemester`

### 2. Pantalla de Bienvenida y Autenticación
**Implementación**:
- Creado componente `WelcomeScreen.tsx`
- Campos: Universidad, Carrera, Email (con validación)
- Botón "SALIR" que preserva datos y solo cierra sesión
- Email se muestra en el header de la aplicación

**Archivos Creados**:
- `components/WelcomeScreen.tsx`

**Archivos Modificados**:
- `App.tsx`: Estado `hasStarted`, `programInfo` con email, función `handleStart`, `handleLogout`

### 3. Rebranding
**Cambios Realizados**:
- Header: `system_ver 1.0` en lugar de `SYSTEM_VER: {version}`
- Footer: `SYS_STATUS: {mode} // TECH_CURRICULUM_V1.0 // {INICIALES_UNIVERSIDAD}`
- Título de aplicación dinámico basado en datos ingresados

### 4. Vista Inicial Limitada
**Implementación**:
- Modificar `loadInitialSubjects()` para filtrar solo primeros 3 semestres
- Mantener funcionalidad de importar JSON completo
- Lógica de visualización de semestres vacíos ajustada

### 5. Exportación de PDF con Vista Previa
**Problema**: PDF se descargaba pero no se abría automáticamente.

**Solución**:
- Generar blob del PDF
- Crear URL temporal
- Abrir en nueva pestaña con `window.open()`
- Limpiar URL después de 1 segundo

### 6. Feedback de JSON Export/Import
**Mejoras**:
- Mensaje de éxito al exportar: "✅ Archivo JSON descargado exitosamente"
- Mensaje de éxito al importar: "¡Datos cargados exitosamente!"

## Tecnologías Utilizadas
- **Frontend**: React 18.2.0 + TypeScript
- **Build Tool**: Vite 6.2.0
- **PDF Generation**: jsPDF 2.5.1, html2canvas 1.4.1
- **Styling**: CSS personalizado con temas claro/oscuro
- **State Management**: React hooks + localStorage

## Estructura del Proyecto
```
gestor-pensum-carrera/
├── components/
│   ├── EditSubjectModal.tsx
│   ├── EjeManagerModal.tsx
│   ├── SubjectCard.tsx
│   ├── ViewSubjectModal.tsx
│   └── WelcomeScreen.tsx
├── App.tsx
├── types.ts
├── constants.ts
├── index.tsx
├── package.json
└── vite.config.ts
```

## Commits Realizados

### Commit 1: `7d0f68a`
```
feat: Implementar editor de carreras con autenticación y botones de eliminación funcionales

- Agregar pantalla de bienvenida (WelcomeScreen) con campos de universidad, carrera y email
- Implementar botón SALIR para cerrar sesión y volver a pantalla de inicio
- Corregir lógica de eliminación para bloquear cuando existen dependencias
- Usar window.alert para mensajes de error en lugar de window.confirm
- Actualizar header con 'system_ver 1.0' y email del usuario
- Corregir importación de JSON para actualizar vista inmediatamente
- Mostrar solo primeros 3 semestres en vista inicial por defecto
```

### Commit 2: `16b4651`
```
fix: Corregir botón SALIR, auto-apertura de PDF y feedback de JSON

- Botón SALIR ahora preserva todos los datos del usuario
- Solo limpia la bandera de sesión y recarga la página
- Eliminar diálogo de confirmación que estaba bloqueado
- PDF ahora se abre automáticamente en nueva pestaña después de descargar
- Permite visualización inmediata del documento generado
- Agregar mensaje de éxito al exportar JSON
- Mejorar feedback visual para el usuario
```

## Lecciones Aprendidas

### 1. Debugging de Diálogos del Navegador
- `window.confirm` puede ser bloqueado por el navegador en ciertos contextos
- Usar `console.log` para verificar que las funciones se ejecutan
- `window.alert` es más confiable para mensajes informativos

### 2. Gestión de Estado en React
- localStorage es efectivo para persistencia simple
- Separar lógica de sesión (`hasStarted`) de datos de usuario
- Usar spread operators para actualizaciones inmutables

### 3. Experiencia de Usuario
- Feedback visual es crucial (mensajes de éxito/error)
- Auto-apertura de archivos generados mejora UX
- Validación de formularios debe ser clara y específica

## Próximos Pasos Planeados

### 1. Subir a GitHub
- Crear repositorio en GitHub
- Conectar repositorio local
- Push de commits existentes

### 2. Implementar Firebase para Multi-Usuario
- Configurar Firebase Realtime Database
- Implementar autenticación con email
- Sincronización automática de datos
- Permitir que múltiples usuarios guarden y recuperen su progreso

### 3. Mejoras Futuras Sugeridas
- Sistema de permisos (admin, editor, viewer)
- Historial de cambios con git-like diff
- Exportar a diferentes formatos (Excel, CSV)
- Validación de dependencias circulares en prerrequisitos
- Modo colaborativo en tiempo real

## Notas Técnicas

### Problema con window.confirm
El navegador estaba bloqueando `window.confirm` selectivamente. Esto se descubrió mediante:
1. Agregar `console.log` antes y después de `window.confirm`
2. Observar que "User cancelled deletion" aparecía inmediatamente
3. Probar con `window.alert` que sí funcionaba
4. Cambiar estrategia de confirmación a bloqueo preventivo

### Gestión de Dependencias
La lógica de eliminación verifica dependencias usando:
```typescript
const dependentSubjects = subjects.filter(s => 
  (s.prerrequisitos || []).includes(id) || 
  (s.correquisitos || []).includes(id)
);
```

### Persistencia de Datos
Se usa localStorage con claves específicas:
- `pensum_subjects`: Array de asignaturas
- `pensum_ejes`: Array de ejes temáticos
- `pensum_info`: Información del programa (universidad, carrera, email)
- `pensum_started`: Flag de sesión activa
- `pensum_semesters`: Número total de semestres
- `pensum_theme`: Tema visual (dark/light)

## Contacto y Mantenimiento
Este proyecto fue desarrollado para la Universidad Militar Nueva Granada (UMNG) como herramienta para diseñar y gestionar currículos académicos de nuevas carreras.

---
**Generado**: 8 de diciembre de 2024
**Versión del Proyecto**: 1.0
**Estado**: Funcional y listo para despliegue
