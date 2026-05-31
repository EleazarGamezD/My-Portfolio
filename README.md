# Portfolio Frontend 🎨

Frontend del Portfolio Dinámico. Construido con **Angular 19** con renderizado del lado del servidor (SSR). Se conecta al [backend de la API](#) para obtener el contenido del portfolio y al CMS administrativo para editar todo el contenido.

> **Plataforma de despliegue recomendada: [Vercel](https://vercel.com)** mediante GitHub Actions. Si prefieres otra plataforma (Netlify, Firebase Hosting, servidor propio), puedes adaptarlo con tus conocimientos ya que es una aplicación Angular estándar con SSR.

---

## 📋 Tabla de contenidos

1. [Requisitos previos](#-requisitos-previos)
2. [Servicios externos necesarios](#-servicios-externos-necesarios)
   - [Google reCAPTCHA (formulario de contacto)](#1-google-recaptcha--formulario-de-contacto)
   - [Vercel (despliegue)](#2-vercel--despliegue)
3. [Instalación y desarrollo local](#-instalación-y-desarrollo-local)
4. [Variables de entorno](#-variables-de-entorno)
5. [Despliegue en Vercel con GitHub Actions](#-despliegue-en-vercel-con-github-actions)
6. [Acceso al CMS](#-acceso-al-cms)

---

## 🛠️ Requisitos previos

Asegúrate de tener instalado en tu máquina:

- **Node.js 22** o superior → [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **Git** → [Descargar aquí](https://git-scm.com/)
- Una cuenta en **GitHub** (para el despliegue automático)

> ⚠️ El frontend **requiere que el backend esté corriendo** para funcionar correctamente. Asegúrate de haber configurado y desplegado el [Portfolio Backend](../Portfolio_backend_v2/README.MD) antes de continuar.

Para verificar tu instalación:

```bash
node --version   # v22.x.x o superior
npm --version    # 10.x.x o superior
```

---

## 🌐 Servicios externos necesarios

### 1. Google reCAPTCHA — Formulario de contacto

El formulario de contacto del portfolio usa reCAPTCHA para evitar spam.

**Si ya creaste la clave al configurar el backend**, solo necesitas la **Site Key** (clave pública). Si no la creaste aún:

1. Ve a [https://www.google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create).
2. Rellena el formulario:
   - **Label**: `Portfolio`
   - **reCAPTCHA type**: **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: añade `localhost` y el dominio de tu portfolio en producción
3. Haz clic en **"Submit"** y copia la **Site Key** (la clave pública).

> La **Site Key** va en la variable `RECAPTCHA_SITE_KEY` (frontend).
> La **Secret Key** va en `RECAPTCHA_SECRET_KEY` (backend).

---

### 2. Vercel — Despliegue

El frontend se despliega a Vercel automáticamente cada vez que haces push a la rama `master`, gracias al workflow de GitHub Actions incluido en el proyecto.

**Para conectar Vercel con GitHub Actions necesitas 3 valores:**

#### Obtener el token de Vercel

1. Ve a [https://vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Haz clic en **"Create"**.
3. Ponle un nombre (ej. `GitHub Actions Portfolio`) y haz clic en **"Create Token"**.
4. **Copia el token ahora**, no podrás verlo de nuevo.

> Este token va en el secret de GitHub: `VERCEL_TOKEN`.

#### Obtener el Org ID y Project ID

1. Primero necesitas crear el proyecto en Vercel. Ve a [https://vercel.com/new](https://vercel.com/new) y conecta tu repositorio del frontend (si no lo has hecho, puedes desplegarlo manualmente primero para que Vercel cree el proyecto).
2. Una vez el proyecto esté creado, ve a la carpeta del frontend en tu máquina y ejecuta:

```bash
# Instala la CLI de Vercel si no la tienes
npm install -g vercel

# Inicia sesión
vercel login

# Vincula el proyecto local con el de Vercel
vercel link
```

3. Esto creará una carpeta `.vercel/` con un archivo `project.json`. Ábrelo:

```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

> - `orgId` → secret de GitHub: `VERCEL_ORG_ID`
> - `projectId` → secret de GitHub: `VERCEL_PROJECT_ID`

---

## 💻 Instalación y desarrollo local

```bash
# 1. Clona el repositorio
git clone <url-del-repositorio>
cd Portfolio_frontend_v2

# 2. Instala las dependencias
npm install --legacy-peer-deps

# 3. Crea el archivo de entorno local
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
# Edita environment.local.ts con los datos de tu backend local
```

### Configurar el entorno local

Edita `src/environments/environment.local.ts`:

```typescript
export const environment = {
  production: false,
  appName: 'Mi Portfolio',
  apiUrl: 'http://localhost:3000',       // URL de tu backend local
  backendApiKey: 'tu-ADMIN_API_KEY',     // La misma que pusiste en el backend
  reCaptchaSiteKey: 'tu-site-key-de-recaptcha',
};
```

### Iniciar el servidor de desarrollo

```bash
# Modo desarrollo estándar
npm start

# Modo desarrollo con backend local
npm run local
```

Abre `http://localhost:4200` en tu navegador. El portfolio cargará los datos desde tu backend local.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `localhost:4200` |
| `npm run local` | Servidor con configuración local |
| `npm run build` | Compila para producción |
| `npm run config` | Genera archivos de entorno desde variables del sistema |
| `npm test` | Ejecuta tests unitarios |

---

## ⚙️ Variables de entorno

El frontend **no usa un archivo `.env`** directamente. Las variables se inyectan en tiempo de build a través del script `npm run config`, que lee variables del sistema operativo y genera los archivos `environment.ts` y `environment.prod.ts`.

### Variables requeridas en el sistema

Estas variables deben estar disponibles cuando se ejecuta `npm run config` (o en los secrets de GitHub Actions):

| Variable del sistema | Descripción |
|---|---|
| `APP_NAME` | Nombre de la aplicación (ej. `Mi Portfolio`) |
| `BACKEND_API_URL` | URL completa del backend (ej. `https://mi-api.vercel.app`) |
| `BACKEND_API_KEY` | La misma `ADMIN_API_KEY` del backend |
| `RECAPTCHA_SITE_KEY` | Site Key pública de Google reCAPTCHA |

### Para desarrollo local sin el script

Puedes editar directamente los archivos de entorno en `src/environments/`:

- `environment.local.ts` → usado con `npm run local`
- `environment.ts` → usado con `npm start`

---

## 🚀 Despliegue en Vercel con GitHub Actions

El proyecto incluye un workflow en `.github/workflows/build-prod.yml` que despliega automáticamente a Vercel cada vez que haces push a la rama `master`.

### Paso 1 — Subir el código a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M master
git remote add origin https://github.com/tu-usuario/portfolio-frontend.git
git push -u origin master
```

### Paso 2 — Configurar los secrets en GitHub

1. Ve a tu repositorio en GitHub.
2. Haz clic en **"Settings"** → **"Secrets and variables"** → **"Actions"**.
3. Haz clic en **"New repository secret"** y añade cada uno de los siguientes secrets:

| Secret | Valor |
|---|---|
| `VERCEL_TOKEN` | Token de API de Vercel (obtenido en el paso anterior) |
| `VERCEL_ORG_ID` | `orgId` del archivo `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` del archivo `.vercel/project.json` |
| `APP_NAME` | Nombre de tu portfolio (ej. `Mi Portfolio`) |
| `BACKEND_API_URL` | URL de tu backend desplegado (ej. `https://mi-api.vercel.app`) |
| `BACKEND_API_KEY` | La misma `ADMIN_API_KEY` del backend |
| `RECAPTCHA_SITE_KEY` | Site Key pública de Google reCAPTCHA |

4. Además, crea un **environment** llamado `Production` en GitHub:
   - Ve a **"Settings"** → **"Environments"** → **"New environment"**
   - Nómbralo `Production` (exactamente así, con mayúscula)
   - Opcionalmente, activa "Required reviewers" para aprobar deploys manualmente

### Paso 3 — Configurar el proyecto en Vercel

1. Ve al proyecto en Vercel y entra a **"Settings" → "General"**.
2. En **"Build & Development Settings"**, asegúrate de que el Framework Preset sea **"Angular"** o **"Other"**.
3. Ya que el build lo hace GitHub Actions (no Vercel directamente), en Vercel ve a **"Settings" → "Git"** y desactiva **"Auto deployments from Git"** para evitar despliegues duplicados.

### Paso 4 — Hacer el primer despliegue

Haz cualquier cambio en el código y haz push a `master`:

```bash
git add .
git commit -m "Configure deployment"
git push origin master
```

Ve a la pestaña **"Actions"** en GitHub para ver el progreso del despliegue. Cuando termine, tu portfolio estará disponible en la URL que Vercel te asignó.

### Paso 5 — Verificar el despliegue

1. Visita la URL de tu portfolio en Vercel.
2. El portfolio debería cargar con todos los datos del backend.
3. Verifica que el formulario de contacto funciona (reCAPTCHA visible).

---

## 🖥️ Acceso al CMS

El CMS administrativo está integrado en el mismo frontend. Para acceder:

1. Ve a `https://tu-portfolio.vercel.app/admin` (o `http://localhost:4200/admin` en desarrollo).
2. Ingresa con las credenciales del usuario administrador:
   - Si usaste el seed inicial (`npm run seed:starter` en el backend), se crea un usuario bootstrap temporal que te pedirá crear tu cuenta definitiva al primer login.
   - Si creaste un usuario manualmente vía API, usa esas credenciales.
3. El CMS permite editar todo el contenido del portfolio: perfil, proyectos, experiencia laboral, skills, temas visuales, etc.

### Recuperar contraseña

Si olvidaste tu contraseña, visita `https://tu-portfolio.vercel.app/admin/forgot-password` e ingresa tu correo. Recibirás un email con un link de recuperación (válido por 10 minutos).

> ⚠️ Para que el envío de correos funcione, el backend debe tener correctamente configuradas las variables `GMAIL_USER`, `GMAIL_PASSWORD` y `FROM`.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── core/           # Servicios, guardias, interceptores
│   ├── features/       # Módulos del portfolio (home, projects, experience...)
│   ├── admin/          # CMS administrativo
│   └── shared/         # Componentes y pipes reutilizables
├── environments/       # Archivos de configuración por entorno
└── assets/             # Imágenes y recursos estáticos locales
```
