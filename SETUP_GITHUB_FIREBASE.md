# Guía de Configuración: GitHub y Firebase

## Parte 1: Subir el Proyecto a GitHub

### Paso 1: Crear Repositorio en GitHub (Manual)

1. Ve a https://github.com/new
2. Configura el repositorio:
   - **Repository name**: `gestor-pensum-fisica` (o el nombre que prefieras)
   - **Description**: "Editor de currículos académicos para UMNG"
   - **Visibility**: Public o Private (según prefieras)
   - **NO marques**: "Initialize this repository with a README" (ya tienes uno local)
3. Click en "Create repository"

### Paso 2: Conectar y Subir (Ejecutar en Terminal)

Copia la URL que GitHub te muestra (algo como: `https://github.com/TU_USUARIO/gestor-pensum-fisica.git`)

Luego ejecuta estos comandos en tu terminal:

```bash
# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/gestor-pensum-fisica.git

# Renombrar rama a main (estándar de GitHub)
git branch -M main

# Subir todo a GitHub
git push -u origin main
```

### Paso 3: Verificar

Ve a tu repositorio en GitHub y deberías ver todos los archivos subidos.

---

## Parte 2: Configurar Firebase para Multi-Usuario

### Paso 1: Crear Proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Click en "Add project" / "Agregar proyecto"
3. Nombre del proyecto: `gestor-pensum-umng`
4. Desactiva Google Analytics (opcional para este proyecto)
5. Click en "Create project"

### Paso 2: Configurar Realtime Database

1. En el menú lateral, ve a "Build" → "Realtime Database"
2. Click en "Create Database"
3. Ubicación: `us-central1` (o la más cercana)
4. Reglas de seguridad: Empieza en **modo de prueba** (cambiaremos después)
5. Click en "Enable"

### Paso 3: Obtener Configuración

1. En el menú lateral, click en el ícono de engranaje ⚙️ → "Project settings"
2. Scroll down hasta "Your apps"
3. Click en el ícono `</>` (Web)
4. Registra la app:
   - App nickname: `gestor-pensum-web`
   - NO marques "Firebase Hosting"
5. Click en "Register app"
6. **COPIA** el objeto `firebaseConfig` que aparece

Debería verse así:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "gestor-pensum-umng.firebaseapp.com",
  databaseURL: "https://gestor-pensum-umng-default-rtdb.firebaseio.com",
  projectId: "gestor-pensum-umng",
  storageBucket: "gestor-pensum-umng.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Paso 4: Instalar Dependencias de Firebase

Ejecuta en tu terminal:

```bash
npm install firebase
```

### Paso 5: Crear Archivo de Configuración

Crea un archivo `src/firebase.ts` con este contenido (reemplaza con TU configuración):

```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
```

### Paso 6: Configurar Reglas de Seguridad

En Firebase Console → Realtime Database → Rules, reemplaza con:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Esto permite que cada usuario solo lea/escriba sus propios datos.

### Paso 7: Modificar App.tsx para Usar Firebase

Necesitarás agregar estas funciones en `App.tsx`:

```typescript
import { ref, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { database, auth } from './firebase';

// Guardar datos del usuario en Firebase
const saveToFirebase = async (userId: string, data: any) => {
  try {
    await set(ref(database, `users/${userId}`), data);
    console.log('Datos guardados en Firebase');
  } catch (error) {
    console.error('Error guardando en Firebase:', error);
  }
};

// Cargar datos del usuario desde Firebase
const loadFromFirebase = async (userId: string) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error cargando desde Firebase:', error);
    return null;
  }
};

// Autenticación
const handleFirebaseLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // Si el usuario no existe, créalo
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
};
```

### Paso 8: Integrar con el Flujo Actual

Modifica `handleStart` en `App.tsx`:

```typescript
const handleStart = async (uni: string, career: string, email: string) => {
  // Generar password simple (o pedirlo al usuario)
  const password = email + '_pensum'; // Temporal, mejorar después
  
  try {
    const user = await handleFirebaseLogin(email, password);
    
    // Cargar datos existentes del usuario
    const userData = await loadFromFirebase(user.uid);
    
    if (userData) {
      // Usuario existente, cargar sus datos
      setSubjects(userData.subjects || []);
      setEjes(userData.ejes || INITIAL_EJES);
      setTotalSemesters(userData.totalSemesters || 10);
      setProgramInfo(userData.programInfo || { name: career, pVersion: '1.0', university: uni, email });
    } else {
      // Usuario nuevo, usar datos por defecto
      setProgramInfo({ name: career, pVersion: '1.0', university: uni, email });
    }
    
    setHasStarted(true);
  } catch (error) {
    alert('Error al iniciar sesión. Verifica tu email.');
  }
};
```

### Paso 9: Auto-guardar en Firebase

Agrega un `useEffect` que guarde automáticamente:

```typescript
useEffect(() => {
  if (hasStarted && auth.currentUser) {
    const dataToSave = {
      subjects,
      ejes,
      programInfo,
      totalSemesters,
      lastUpdated: new Date().toISOString()
    };
    
    // Guardar cada 5 segundos (debounce)
    const timer = setTimeout(() => {
      saveToFirebase(auth.currentUser!.uid, dataToSave);
    }, 5000);
    
    return () => clearTimeout(timer);
  }
}, [subjects, ejes, programInfo, totalSemesters, hasStarted]);
```

### Paso 10: Probar

1. Recarga la aplicación
2. Ingresa un email (ej: `test@umng.edu.co`)
3. Los datos se guardarán automáticamente en Firebase
4. Cierra sesión y vuelve a entrar con el mismo email
5. Deberías ver tus datos restaurados

---

## Seguridad y Mejoras Futuras

### Mejorar Autenticación
- Pedir contraseña real al usuario
- Implementar "Forgot Password"
- Agregar autenticación con Google

### Optimizar Sincronización
- Usar debounce más inteligente
- Mostrar indicador de "guardando..."
- Manejar conflictos de sincronización

### Backup
- Mantener export/import JSON como backup
- Permitir descargar todos los datos del usuario

---

## Resumen de Costos

### GitHub
- ✅ **Gratis** para repositorios públicos y privados (hasta 2000 minutos CI/CD)

### Firebase
- ✅ **Gratis** en plan Spark:
  - 1 GB de almacenamiento
  - 10 GB de transferencia/mes
  - 100 conexiones simultáneas
  - Suficiente para ~50-100 usuarios activos

---

## Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica las reglas de Firebase
3. Confirma que las credenciales en `firebase.ts` son correctas

**¡Listo para empezar!** 🚀
