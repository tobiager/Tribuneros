<p align="center">
  <img src="./assets/Tribuneros.png" alt="Logo de TRIBUNEROS" width="100"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase"/>
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge"/>
</p>

# ⚽ Tribuneros - La red social del fútbol

**Tribuneros** es una plataforma web desarrollada con **Next.js 15 + Supabase** que funciona como un *Letterboxd del fútbol*. Fue creada con el objetivo de brindarle a los hinchas una forma moderna y social de **registrar, puntuar y comentar los partidos que ven**, ya sea en la cancha o desde casa. La app también permite descubrir qué están viendo otros usuarios, guardar favoritos, compartir opiniones y seguir equipos.

---

## 📌 Ficha Técnica

| Atributo                 | Detalle                                 |
|--------------------------|------------------------------------------|
| Nombre del Proyecto      | Tribuneros                               |
| Tipo de Proyecto         | Aplicación Web / Red Social Deportiva    |
| Tecnologías Principales  | Next.js 15, Supabase, TailwindCSS, PostgreSQL |
| Lenguaje Principal       | TypeScript                               |
| Autenticación            | Supabase Auth (Google, Twitter)          |
| Hosting                  | Vercel                                   |
| Base de Datos            | Supabase (PostgreSQL)                    |
| Estado                   | En desarrollo                            |
| Licencia                 | MIT                                      |
| Última actualización     | Julio 2025                               |
| Autor principal          | Tobias Orban - tobiasorban00@gmail.com   |

---

## 🧠 ¿Qué hace Tribuneros?

- 🗓️ Muestra los **partidos del día** desde una API externa de fútbol.
- 🌟 Permite **puntuar los partidos** del 1 al 5 estrellas.
- 💬 Permite dejar y ver **opiniones escritas** de cada partido.
- 👁️ Marcar si viste un partido (en TV o en la cancha).
- ⭐ Guardar partidos como **favoritos**.
- 👤 Acceder a tu **perfil**, donde se muestran:
  - Partidos que viste
  - Opiniones que dejaste
  - Favoritos
  - Equipos que seguís
  - Estadísticas personales

---

## 🔍 Funcionalidades Principales

### 🎯 Partidos
- 🔁 Sincronización diaria con la API para mostrar los partidos de hoy.
- 🧠 Lógica para seleccionar y mostrar partidos destacados.
- ⭐ Sistema de puntuación con promedio visible.
- 🗣️ Sistema de opiniones públicas por partido.
- 📌 Favoritos por usuario.
- ✅ Visualización marcada (TV / cancha).
- ⏰ Función futura: "Recordame cuando empiece".

### 👤 Perfil del Usuario
- Historial de partidos vistos.
- Opiniones escritas.
- Favoritos listados.
- Estadísticas generales.
- Equipos seguidos (en desarrollo).

---

## 🗄️ Base de Datos y Backend (Supabase)

La base de datos utiliza PostgreSQL en Supabase con políticas de seguridad (RLS). Algunas de las tablas clave:

| Tabla              | Descripción                                        |
|--------------------|----------------------------------------------------|
| matches            | Partidos sincronizados desde la API externa        |
| match_ratings      | Puntuaciones (1 a 5 estrellas)                     |
| match_opinions     | Opiniones escritas por los usuarios                |
| favorites          | Relación usuario - partidos favoritos              |
| views              | Registro de visualización (TV / cancha)           |
| user_profiles      | Perfil extendido de cada usuario                   |
| teams / leagues    | Info de equipos y ligas (nombre, escudo, país)     |

🔒 Toda la sincronización se hace desde `lib/database-service.ts` con control de errores y permisos.

---

## 🔐 Seguridad y Permisos (RLS)

Tribuneros usa **Row Level Security** activado en Supabase para asegurar integridad y privacidad.  
Características de seguridad implementadas:

- ✅ Cada usuario solo puede leer/escribir su información.
- ✅ Roles como `service_role` y `admin` pueden insertar partidos.
- ✅ Todas las funciones PostgreSQL personalizadas usan:
  - SECURITY DEFINER
  - SET search_path TO public

---

## 📁 Estructura del Proyecto (Next.js App Router)

```bash
/app
├── page.tsx                  → Página de inicio
├── partidos/
│   ├── hoy/                  → Lista partidos del día desde API
│   └── destacados/           → Partidos destacados (BD)
├── profile/
│   ├── favorites/            → Favoritos del usuario
│   ├── opiniones/            → Opiniones del usuario
│   └── partidos-vistos/      → Partidos que vio

/components
├── MatchCard.tsx            → Componente visual del partido
├── StarRating.tsx           → Componente para puntuar
├── OpinionForm.tsx          → Formulario de opinión
├── Navbar.tsx               → Barra de navegación con auth
├── Footer.tsx               → Footer reutilizable

/lib
├── supabase.ts              → Cliente Supabase
├── auth.ts                  → Funciones de autenticación
└── database-service.ts      → Lógica de interacción con la BD

/public
└── assets/                  → Logos, escudos, íconos
```

---

## 🚀 Instalación y Ejecución Local

```bash
# Cloná el proyecto
git clone https://github.com/tu-usuario/tribuneros.git
cd tribuneros

# Instalá dependencias
npm install

# Configurá las variables de entorno en `.env.local`
NEXT_PUBLIC_SUPABASE_URL=https://<tu-url>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

# Ejecutá en desarrollo
npm run dev
```

---

## 🧪 Testeo Manual sin la API

1. Insertá partidos manualmente en la tabla `matches`.
2. Verificá si podés puntuar, opinar, ver, marcar como favorito.
3. Asegurate que el flujo de perfil también funcione.

---

## 🧰 Tecnologías Usadas

- Next.js 15 (App Router, SSR/ISR)
- Supabase (Auth, DB, Edge Functions)
- PostgreSQL (con RLS)
- TailwindCSS (estilos rápidos y responsivos)
- TypeScript (tipado estricto)
- Vercel (hosting)

---

## 🧭 Roadmap / Pendientes

- [ ] Notificaciones tipo "Recordame este partido"
- [ ] Sección de Equipos Favoritos en el perfil
- [ ] Buscador general de partidos
- [ ] Panel de administración (para destacar partidos)
- [ ] Feed tipo red social con actividad de usuarios
- [ ] Sistema de badges y estadísticas avanzadas
- [ ] Versión mobile con PWA

---

## 🤝 Cómo contribuir

1. Hacé un fork del repo.
2. Clonalo localmente.
3. Creá una nueva rama (`git checkout -b feature-nombre`).
4. Hacé tus cambios y probalos.
5. Abrí un pull request con una descripción clara.

---

## 👨‍💻 Autor

**Tobias Orban**  
📧 tobiasorban00@gmail.com  
🐦 [@tobiager](https://twitter.com/tobiager)  
🎓 Estudiante de Licenciatura en Sistemas (UNNE)  
❤️ Fanático de River, el buen fútbol y el código limpio

---

<p align="center"><b>❤️🐔 Hecho con pasión y dedicación por Tobias</b></p>
