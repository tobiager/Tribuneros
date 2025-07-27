<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Soccer_ball_icon_black.svg/1024px-Soccer_ball_icon_black.svg.png" alt="Logo Tribuneros" width="100"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge"/>
</p>

# ⚽ Tribuneros - La red social del fútbol

**Tribuneros** es una aplicación web moderna desarrollada con **Next.js 15 + Supabase** que funciona como una especie de *Letterboxd del fútbol*. El objetivo es ofrecer una plataforma donde los hinchas puedan **registrar, puntuar y comentar los partidos que ven**, conectar con otros usuarios y compartir su experiencia futbolera.

---

## 🧠 ¿Qué hace Tribuneros?

- 📅 Muestra los **partidos del día** (desde una API externa).
- 🌟 Permite **puntuar partidos** del 1 al 5 estrellas.
- 💬 Dejar **opiniones escritas** sobre los partidos.
- 👁️ Marcar si **viste el partido** (en TV o en la cancha).
- 📌 Guardar **favoritos**.
- 👤 Acceder a tu perfil para ver estadísticas como:
  - Partidos que viste
  - Opiniones que dejaste
  - Favoritos
  - Equipos que seguís
  - Partidos que te marcaron

---

## 🧱 Estructura del Proyecto

/app
├── page.tsx                  → Página principal
├── partidos/                 → Sección de partidos (Hoy / Destacados)
│   ├── hoy/                  → Consume la API y muestra partidos del día
│   ├── destacados/           → Partidos destacados seleccionados manualmente
├── profile/                  → Perfil del usuario
│   ├── favorites/            → Partidos marcados como favoritos
│   ├── opiniones/            → Opiniones dejadas por el usuario
│   ├── partidos-vistos/      → Partidos que el usuario ya vio
│
/components
├── MatchCard.tsx            → Componente visual para partidos
├── Navbar.tsx               → Navbar con autenticación
├── Footer.tsx               → Footer reutilizable
├── StarRating.tsx           → Estrellas para puntuar partidos
├── OpinionForm.tsx          → Componente de opinión
│
/lib
├── supabase.ts              → Conexión con Supabase
├── auth.ts                  → Funciones de autenticación
├── database-service.ts      → Maneja lectura/escritura en la DB
│
/public
├── assets/                  → Logos, íconos, escudos, etc.
---

## 🗄️ Base de Datos

Actualmente usamos **Supabase** como backend y base de datos. Algunas tablas importantes:

- `matches` → partidos sincronizados desde la API externa
- `match_ratings` → puntuaciones (estrellas) de cada usuario
- `match_opinions` → opiniones escritas de usuarios
- `favorites` → partidos marcados como favoritos
- `views` → vista del partido (TV o estadio)
- `user_profiles` → perfil extendido del usuario
- `teams` / `leagues` → info de equipos y ligas (con escudos)

> **Nota:** Toda la sincronización con la API se hace desde `database-service.ts` con control de permisos, seguridad y manejo de errores.

---

## 🔐 Seguridad y RLS

Supabase tiene **RLS activado** (Row Level Security).  
Se han creado políticas personalizadas para que:

- Cada usuario solo vea/modifique sus datos.
- Roles especiales (admin/service) puedan insertar partidos.
- Todas las funciones usan `SECURITY DEFINER` y `SET search_path TO public`.

---

## 🔧 Funcionalidades principales implementadas

### ✅ Sección Partidos

- ✔️ Partidos de hoy desde la API
- ✔️ Partidos destacados desde la base de datos
- ✔️ Puntuar y ver promedio
- ✔️ Dejar y ver opiniones
- ✔️ Marcar como visto
- ✔️ Favorito

### ✅ Perfil

- ✔️ Mostrar favoritos
- ✔️ Opiniones dejadas
- ✔️ Cantidad de partidos vistos
- ✔️ Últimos partidos vistos
- ✔️ Equipos favoritos (en desarrollo)

---

## 🧪 Testing manual sin la API

Para probar la app sin la API externa:

1. Cargar partidos manualmente en la tabla `matches` (campos mínimos: id, fecha, equipos, hora, liga).
2. Verificar funcionamiento de puntuación, opiniones, favoritos y vistas en esas entradas.
3. Probar en local usando `npm run dev`.

---

## 🧰 Tecnologías Usadas

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql"/>
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss"/>
</p>

---

## 📋 Cómo contribuir

1. Forkeá el repo.
2. Clonalo y creá una rama nueva.
3. Instalá dependencias con `npm install`.
4. Configurá `.env.local` con tu Supabase URL y Key.
5. Hacé tus cambios y abrí un pull request con descripción clara.

---

## 📌 Pendientes / En desarrollo

- [ ] Notificación para partidos futuros ("recordame cuando empiece")
- [ ] Equipos favoritos en el perfil
- [ ] Buscador de partidos
- [ ] Panel de administración para gestionar partidos destacados
- [ ] Feed de actividad

---

## 🤝 Autores y contacto

**Tobias Orban**  
🧠 Ideador del proyecto y desarrollo fullstack  
📧 tobiasorban00@gmail.com  
🐦 [@tobiager](https://twitter.com/tobiager)

> Si querés sumarte al proyecto, ¡mandame mensaje o hacé un fork y empezá a codear!

---

<p align="center"><b>⚽️ Hecho con amor, fútbol y código en Argentina 🇦🇷</b></p>