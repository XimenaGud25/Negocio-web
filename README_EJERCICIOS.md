# 🏋️ Gym Exercises Frontend

Aplicación frontend desarrollada con Next.js que consume la API de ejercicios de gimnasio en español desde `https://exercises-gym.onrender.com`.

## ✨ Características principales

- 🎯 **Biblioteca completa de ejercicios** - Acceso a una amplia base de datos de ejercicios en español
- 🔍 **Búsqueda avanzada** - Filtros por nombre, dificultad, grupo muscular y equipamiento
- 📱 **Responsive Design** - Optimizado para móviles y escritorio
- 💪 **Información detallada** - Instrucciones, músculos trabajados, consejos y variaciones
- 📊 **Paginación** - Navegación eficiente a través de grandes cantidades de ejercicios

## 🚀 Inicio rápido

### Requisitos previos

- Node.js 18+
- pnpm, npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [repo-url]
   cd entrenador
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local`:
   ```env
   # Configuración básica de Next.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Base de datos (si usas funcionalidades adicionales)
   DATABASE_URL="your-database-url"
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm run dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🎮 Uso de la aplicación

### Página de ejercicios `/exercises`

- **Búsqueda libre**: Busca ejercicios por nombre
- **Filtro por dificultad**: Principiante, Intermedio, Avanzado
- **Filtro por grupo muscular**: Pecho, Espalda, Piernas, etc.
- **Filtro por equipamiento**: Peso corporal, Mancuernas, Máquinas, etc.
- **Paginación**: Navega a través de los resultados

### Información de cada ejercicio

- Nombre en español e inglés
- Descripción detallada
- Nivel de dificultad con código de colores
- Músculos principales y secundarios
- Equipamiento necesario
- Instrucciones paso a paso
- Consejos prácticos
- Variaciones del ejercicio

## 📋 API Externa

Esta aplicación consume datos de la API externa:

- **URL**: `https://exercises-gym.onrender.com`
- **Documentación**: `https://exercises-gym.onrender.com/docs`
- **Características**:
  - ✅ Ejercicios en español
  - ✅ Filtros y búsqueda
  - ✅ Paginación
  - ✅ Información completa
  - ✅ Sin autenticación requerida para consultas

## 🏗️ Estructura del proyecto

```
app/
├── exercises/
│   └── page.tsx              # Página principal de ejercicios
├── api/
│   ├── exercises/
│   │   └── route.ts          # Proxy a la API externa
│   ├── muscles/
│   │   └── route.ts          # Grupos musculares
│   └── equipment/
│       └── route.ts          # Equipamiento
├── ...otros archivos
```

## 🔧 Configuración API

### Endpoints implementados

| Endpoint | Descripción | Parámetros |
|----------|-------------|------------|
| `GET /api/exercises` | Lista ejercicios | `page`, `limit`, `search`, `difficulty`, `muscleId`, `equipmentId` |
| `GET /api/muscles` | Grupos musculares | - |
| `GET /api/equipment` | Equipamiento | - |

### Parámetros de filtrado

- `page`: Número de página (default: 1)
- `limit`: Ejercicios por página (default: 12)
- `search`: Término de búsqueda
- `difficulty`: `beginner`, `intermediate`, `advanced`
- `muscleId`: UUID del grupo muscular
- `equipmentId`: UUID del equipamiento

## 🎨 UI/UX Features

- **Diseño oscuro** con acentos amarillos
- **Cards informativas** con toda la información del ejercicio
- **Indicadores de dificultad** con colores distintivos
- **Loading states** y manejo de errores
- **Filtros intuitivos** con dropdowns
- **Botón de limpiar filtros**
- **Paginación funcional**

## 🚦 Estados de la aplicación

- **Loading**: Indicador de carga con spinner
- **Error**: Mensajes de error con opción de reintentar
- **Empty state**: Mensaje cuando no hay resultados
- **Success**: Visualización de ejercicios

## 📱 Responsive Design

- **Mobile first**: Optimizado para dispositivos móviles
- **Grid adaptable**: 1 columna en móvil, 2 en desktop
- **Filtros stackeables**: Se reorganizan en pantallas pequeñas

## 🔄 Cambios realizados

### Migración de ExerciseDB a Gym API

1. **✅ API Route actualizada** - Ahora consume `https://exercises-gym.onrender.com`
2. **✅ Interfaz Exercise modernizada** - Incluye todos los campos del seed-data
3. **✅ UI mejorada** - Diseño más completo y funcional
4. **✅ Filtros avanzados** - Músculos y equipamiento
5. **✅ Cache optimizado** - 1 hora para mejor rendimiento
6. **✅ Limpieza de código** - Eliminación de archivos de traducción obsoletos

### Nuevos campos soportados

- `nameEs`, `nameEn`: Nombres en ambos idiomas
- `descriptionEs`, `descriptionEn`: Descripciones detalladas
- `difficulty`: Nivel de dificultad
- `primaryMuscles`, `secondaryMuscles`: Arrays de músculos
- `equipment`: Array de equipamiento
- `instructions`: Instrucciones paso a paso
- `tips`: Consejos prácticos
- `variations`: Variaciones del ejercicio
- `images`: URLs de imágenes

## 🚀 Deployment

Para producción:

```bash
# Build
pnpm run build

# Start
pnpm start
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

**Desarrollado con ❤️ usando Next.js y la API de Gym Exercises**