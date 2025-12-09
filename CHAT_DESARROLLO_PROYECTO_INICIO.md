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

### Commit 3: `75a285a`
```
docs: Agregar documentación completa del proyecto

- CHAT_DESARROLLO_PROYECTO_INICIO.md: Historial completo de desarrollo
- README.md: Documentación profesional para GitHub
- SETUP_GITHUB_FIREBASE.md: Guía paso a paso para GitHub y Firebase
- Preparación para despliegue y almacenamiento multi-usuario
```

### Commit 4: `761a147`
```
feat: Implement GitHub as database storage (Option 2)

- Add github-api.ts with save/load functions
- Create public/users/ directory for user data files
- Update WelcomeScreen with GitHub token input
- Modify App.tsx with auto-save to GitHub (5s debounce)
- Add sync status state management
- Load existing user data from GitHub on login
- Fallback to localStorage when no token provided
```

### Commit 5: `aaa7ff7`
```
docs: Add GitHub storage implementation guide

- GITHUB_STORAGE_GUIDE.md: Guía completa de uso
- Instrucciones para generar token
- Detalles técnicos de implementación
- Troubleshooting y mejores prácticas
```

## Implementación de GitHub Storage (Opción 2)

### 7. Almacenamiento Multi-Usuario con GitHub
**Fecha**: 9 de diciembre de 2024

**Problema**: Necesidad de almacenamiento compartido para múltiples usuarios sin configurar un backend externo.

**Solución Implementada**: GitHub como "Base de Datos"
- Usar el repositorio de GitHub para almacenar archivos JSON de usuarios
- Cada usuario tiene su archivo: `public/users/email@domain.json`
- API de GitHub para leer/escribir archivos
- Gratis, con versionado automático

**Archivos Creados**:
- `github-api.ts`: Módulo de integración con GitHub API
  - `saveUserDataToGitHub()`: Guardar datos del usuario
  - `loadUserDataFromGitHub()`: Cargar datos existentes
  - `checkUserDataExists()`: Verificar si existe archivo
  - `validateGitHubToken()`: Validar token
- `public/users/README.md`: Documentación de estructura
- `public/users/.gitkeep`: Mantener directorio en git
- `GITHUB_STORAGE_GUIDE.md`: Guía completa de uso

**Archivos Modificados**:
- `components/WelcomeScreen.tsx`:
  - Checkbox "Usar GitHub Storage"
  - Campo de GitHub Personal Access Token (password)
  - Link directo para generar token con scopes correctos
  - Validación de token requerido si GitHub está habilitado
- `App.tsx`:
  - Estado `githubToken` y `syncStatus`
  - `handleStart` ahora es async y acepta token opcional
  - Auto-carga de datos desde GitHub si existe
  - Auto-guardado con debounce de 5 segundos
  - Indicador de estado de sincronización (pendiente en UI)

**Características**:
- ✅ **Auto-save**: Guarda automáticamente cada 5 segundos después de cambios
- ✅ **Auto-load**: Carga datos existentes del usuario al iniciar sesión
- ✅ **Fallback**: Usa localStorage si no hay token de GitHub
- ✅ **Versionado**: Historial completo de cambios en GitHub
- ✅ **Gratis**: Sin límites de uso ni costos
- ✅ **Transparente**: Todos los datos visibles en el repositorio
- ⚠️ **Público**: Los datos son visibles públicamente en el repo

**Flujo de Uso**:
1. Usuario genera GitHub Personal Access Token (scope: `repo`)
2. En WelcomeScreen, marca "Usar GitHub Storage" y pega token
3. App intenta cargar datos existentes de `public/users/{email}.json`
4. Si existen, los carga; si no, usa datos por defecto
5. Cada cambio activa auto-guardado (debounced 5s)
6. Token se guarda en localStorage para próximas sesiones

**Ventajas sobre Firebase**:
- No requiere configuración externa
- Usa infraestructura existente (GitHub)
- Versionado automático de cambios
- Sin límites de uso
- Más simple de implementar

**Limitaciones**:
- Datos públicos (no para información sensible)
- Requiere que usuario genere su propio token
- Rate limit de GitHub API (5000 req/hora autenticado)

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

### 4. GitHub como Backend
- GitHub API es sorprendentemente útil para almacenamiento simple
- Debouncing es esencial para evitar rate limits
- Base64 encoding/decoding para contenido de archivos
- SHA requerido para actualizar archivos existentes

## Estructura Actualizada del Proyecto
```
gestor-pensum-carrera/
├── components/
│   ├── EditSubjectModal.tsx
│   ├── EjeManagerModal.tsx
│   ├── SubjectCard.tsx
│   ├── ViewSubjectModal.tsx
│   └── WelcomeScreen.tsx
├── public/
│   └── users/
│       ├── .gitkeep
│       ├── README.md
│       └── [user@email.json] (generado automáticamente)
├── App.tsx
├── github-api.ts (NUEVO)
├── types.ts
├── constants.ts
├── index.tsx
├── package.json
├── vite.config.ts
├── README.md
├── CHAT_DESARROLLO_PROYECTO_INICIO.md
├── SETUP_GITHUB_FIREBASE.md
├── GITHUB_STORAGE_GUIDE.md (NUEVO)
└── vercel.json (NUEVO)
```

## Despliegue en Vercel y Correcciones Finales
**Fecha**: 9 de diciembre de 2024

### 1. Despliegue en Producción
- **Plataforma**: Vercel
- **Método**: Importación directa desde GitHub
- **Configuración**: Zero-config (detección automática de Vite)
- **URL**: `https://generador-de-pensum.vercel.app` (aproximado)

### 2. Problema de Codificación de Caracteres
**Problema Detectado**: Las tildes y caracteres especiales se mostraban incorrectamente (ej: `Ã¡` en lugar de `á`) en la versión desplegada.
**Causa**: Vercel/Servidor no estaba sirviendo los archivos con el header `Content-Type: text/html; charset=utf-8` explícito o correcta interpretación.

**Solución Implementada**:
- Creación de archivo de configuración `vercel.json` en la raíz.
- Forzar headers HTTP para todo el contenido:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/html; charset=utf-8"
        }
      ]
    }
  ]
}
```

### Commits Adicionales

#### Commit 6: `b9e9722`
```
fix: Add UTF-8 encoding configuration for Vercel

- Add vercel.json configuration file
- Force Content-Type header with charset=utf-8 for all routes
- Fix character display issues (tildes) in production
```

## Próximos Pasos Sugeridos

### 1. Completar UI de Sync Status
- Agregar indicador visual en header
- Mostrar "✓ Synced", "⟳ Saving...", "⚠ Error"
- Código disponible en `GITHUB_STORAGE_GUIDE.md`

### 2. Mejoras de Seguridad
- Validar token antes de guardar
- Manejar errores de API más gracefully
- Agregar retry logic para fallos de red

### 3. Funcionalidades Adicionales
- Historial de versiones (usando commits de GitHub)
- Comparar versiones (diff)
- Restaurar versión anterior
- Exportar historial completo

### 4. Optimizaciones
- Comprimir JSON antes de guardar
- Cache de datos en IndexedDB
- Sincronización offline (service worker)

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
- `github_token`: Token de GitHub (NUEVO)

### GitHub API Integration
```typescript
// Guardar datos
const response = await fetch(
  `https://api.github.com/repos/owner/repo/contents/public/users/${email}.json`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Update pensum data for ${email}`,
      content: btoa(JSON.stringify(data)),
      sha: existingSHA // Requerido para updates
    })
  }
);
```

## Contacto y Mantenimiento
Este proyecto fue desarrollado para la Universidad Militar Nueva Granada (UMNG) como herramienta para diseñar y gestionar currículos académicos de nuevas carreras.

**Repositorio**: https://github.com/nerinconq/generador-de-pensum

---
**Generado**: 8-9 de diciembre de 2024
**Versión del Proyecto**: 1.1
**Estado**: Funcional con almacenamiento multi-usuario
