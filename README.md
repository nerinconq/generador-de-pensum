# Pensum Tech

Editor de currículos académicos para diseñar y gestionar programas de estudio universitarios.

## 🎯 Características

- ✅ **Pantalla de Bienvenida**: Registro con universidad, carrera y email
- ✅ **Gestión de Asignaturas**: Crear, editar y eliminar materias con validación de dependencias
- ✅ **Ejes Temáticos**: Organización por áreas de conocimiento con códigos de color
- ✅ **Prerrequisitos y Correquisitos**: Sistema de dependencias entre asignaturas
- ✅ **Exportación PDF**: Generación automática con vista previa
- ✅ **Import/Export JSON**: Guardar y cargar progreso
- ✅ **Temas Claro/Oscuro**: Interfaz adaptable
- ✅ **Drag & Drop**: Mover asignaturas entre semestres
- ✅ **Búsqueda**: Filtrar asignaturas por nombre o código

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm run preview
```

## 📋 Uso

### 1. Pantalla de Bienvenida
- Ingresa el nombre de tu universidad
- Ingresa el nombre de la carrera
- Ingresa tu email (con validación)
- Click en "COMENZAR DISEÑO"

### 2. Modo Edición
- Click en "EDIT" para habilitar edición
- Gestiona ejes temáticos desde el botón "EJES"
- Crea asignaturas con el botón "+" en cada semestre
- Arrastra asignaturas entre semestres

### 3. Gestión de Asignaturas
- **Crear**: Click en "+" en el semestre deseado
- **Editar**: Click en la tarjeta de la asignatura
- **Eliminar**: Solo si no es prerrequisito/correquisito de otras

### 4. Exportar/Importar
- **PDF**: Genera documento con vista previa automática
- **JSON**: Guarda tu progreso para continuar después

### 5. Cerrar Sesión
- Click en "SALIR" para volver a la pantalla de inicio
- Tus datos se conservan en localStorage

## 🛡️ Reglas de Eliminación

### Asignaturas
- ❌ No se puede eliminar si es prerrequisito de otra asignatura
- ❌ No se puede eliminar si es correquisito de otra asignatura
- ✅ Se puede eliminar si no tiene dependencias

### Ejes Temáticos
- ❌ No se puede eliminar si tiene asignaturas asociadas
- ✅ Se puede eliminar si está vacío

### Semestres
- ❌ No se puede eliminar si contiene asignaturas
- ✅ Se puede eliminar si está vacío

## 🗂️ Estructura de Datos

### Asignatura
```typescript
{
  id: string;
  nombre: string;
  semestre: number;
  eje: string;
  prerrequisitos: string[];
  correquisitos: string[];
  details: {
    creditos: string;
    horasTeoria: string;
    horasPractica: string;
    horasIndependientes: string;
    objetivos: string;
    competencias: string;
    syllabus: SyllabusItem[];
  }
}
```

### Eje Temático
```typescript
{
  id: string;
  nombre: string;
  label: string;
  color: TailwindColor;
}
```

## 🔧 Tecnologías

- **React** 18.2.0
- **TypeScript** 5.8.2
- **Vite** 6.2.0
- **jsPDF** 2.5.1
- **html2canvas** 1.4.1

## 📦 Próximas Funcionalidades

- 🔄 **Firebase Integration**: Almacenamiento multi-usuario en la nube
- 👥 **Colaboración**: Múltiples usuarios trabajando en el mismo pensum
- 📊 **Analytics**: Estadísticas del programa (total créditos, distribución por eje)
- 📱 **Responsive**: Optimización para tablets y móviles
- 🔐 **Autenticación Avanzada**: Login con Google/Microsoft

## 🐛 Solución de Problemas

### Los botones de eliminar no funcionan
- Asegúrate de estar en modo EDIT
- Verifica que no existan dependencias (prerrequisitos/correquisitos)
- Recarga la página (F5)

### El PDF no se abre
- Verifica que tu navegador permita pop-ups
- Revisa la carpeta de descargas

### Los datos no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- No uses modo incógnito (los datos se borran al cerrar)

## 📄 Licencia

Este proyecto fue desarrollado para la Universidad Militar Nueva Granada (UMNG).

## 👨‍💻 Desarrollo

### Commits Importantes

- `7d0f68a`: Implementación inicial con autenticación y botones funcionales
- `16b4651`: Corrección de SALIR, PDF auto-open y feedback JSON

### Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ para UMNG**
