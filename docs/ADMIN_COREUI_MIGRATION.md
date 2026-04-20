# Admin CoreUI Migration

## Objetivo aprobado

Mantener el portfolio publico con su template actual y migrar solo la zona admin a un dashboard CoreUI.

## Referencias usadas

1. `../BookingAgency_Frontend_V2`
   - referencia principal del shell CoreUI real
   - referencia del manejo de imagenes convertido a base64/webp desde frontend

2. `../coreui-free-angular-admin-template-main`
   - referencia de layout oficial CoreUI para Angular
   - sidebar, header sticky, nav items, icon set y estructura base de rutas

## Estado actual

- CoreUI ya fue agregado a `My-Portfolio` con versiones compatibles con Angular 19.
- El admin ya no entra por un componente monolitico directo; ahora tiene shell propio:
  - `admin/login`
  - `admin/dashboard/overview`
  - `admin/dashboard/projects`
  - `admin/dashboard/profile`
  - `admin/dashboard/skills`
  - `admin/dashboard/experience`
  - `admin/dashboard/testimonials`
  - `admin/dashboard/resumes`
  - `admin/dashboard/socialLinks`
  - `admin/dashboard/users`
- El dashboard actual sigue reutilizando la logica CRUD existente, pero ahora sincroniza la seccion activa con la ruta.
- El layout nuevo esta en `src/app/pages/admin-layout`.

## Decision de arquitectura

1. No tocar la UI publica del portfolio.
2. Encapsular el admin en un shell CoreUI con sidebar y header propios.
3. Mantener por ahora la logica CRUD dentro de `AdminDashboardComponent`.
4. En una siguiente iteracion, separar cada seccion en una pagina de ruta real para reducir carga y estado compartido.

## Plan de trabajo recomendado

### Fase 1. Shell y navegacion

- [x] Instalar CoreUI compatible con Angular 19.
- [x] Registrar iconos CoreUI en la app.
- [x] Crear layout `admin-layout` con sidebar/header/footer.
- [x] Migrar el admin a rutas por seccion.

### Fase 2. UX real del dashboard

- [ ] Reemplazar el nav secundario de botones dentro del dashboard por breadcrumbs o tabs CoreUI.
- [ ] Separar cada seccion en pagina hija para evitar que siempre cargue todo el estado.
- [ ] Usar componentes CoreUI de tablas, formularios y cards donde aporte valor real.
- [ ] Añadir toasts/modals consistentes para guardar/eliminar.

### Fase 3. Imagenes embebidas en DB

- [x] Reservar interfaces frontend para imagenes base64/webp.
- [x] Reservar utilidad frontend para comprimir y convertir a base64.
- [ ] Adaptar `projects` para dejar de depender de URLs manuales y enviar `IProjectAsset` con base64.
- [ ] Adaptar `profile.metadata.heroSlides[].image` al mismo contrato.
- [ ] Definir contrato backend final para Mongo como bucket logico.
- [ ] Normalizar respuestas para que frontend pueda reconstruir previews via `data:<mime>;base64,...`.

## Contrato objetivo de imagen

### Frontend draft

```ts
interface IBase64ImageAsset {
  base64: string;
  mimeType: string;
  fileName: string;
  extension?: string;
  previewUrl?: string;
}
```

### Persistencia sugerida en Mongo

```ts
interface IStoredImageAsset {
  file: string;
  mimeType?: string;
  fileName?: string;
  extension?: string;
}
```

## Nota critica

La siguiente IA no debe volver a llevar `projects.coverImage` e `images` solo como URLs si el objetivo es usar Mongo como bucket logico. La ruta correcta es migrar los formularios hacia assets embebidos y luego endurecer el backend para aceptar y devolver ese contrato de manera consistente.
