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

- `My-Portfolio` ya quedó alineado con Angular 21 y el builder moderno usado por `BookingAgency_Frontend_V2`.
- CoreUI ya fue agregado a `My-Portfolio` con versiones alineadas a esa base moderna.
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
- El antiguo `AdminDashboardComponent` fue retirado de rutas y borrado del proyecto.
- Cada seccion del admin ahora es una pagina hija real dentro del shell CoreUI.
- La logica CRUD compartida vive en `src/app/core/services/admin-dashboard/admin-dashboard.facade.ts`.
- El layout nuevo esta en `src/app/pages/admin-layout`.
- El shell admin ya muestra breadcrumb dinamico por seccion y titulo contextual en header.
- Las paginas `overview`, `projects`, `profile`, `skills`, `experience`, `testimonials`, `resumes`, `socialLinks` y `users` ya empezaron a reemplazar wrappers HTML genericos por `c-alert`, `c-card`, `c-spinner` y `cButton` de CoreUI.
- El feedback del admin ya usa `ngx-toastr`, reutilizando el mismo toast del UI publico en lugar de banners inline para acciones CRUD y errores operativos.
- SSR y prerender vuelven a compilar con Angular 21 tras adaptar `main.server.ts` y `app.config.server.ts`.
- La unica libreria heredada pendiente de reemplazo es `ng-recaptcha`, que no publica soporte oficial para Angular 21.

## Decision de arquitectura

1. No tocar la UI publica del portfolio.
2. Encapsular el admin en un shell CoreUI con sidebar y header propios.
3. Centralizar la logica CRUD del admin en un facade compartido para evitar repetir estado entre paginas.
4. Renderizar cada seccion del admin como pagina hija real dentro del shell CoreUI.

## Plan de trabajo recomendado

### Fase 1. Shell y navegacion

- [x] Instalar CoreUI sobre base Angular 21 alineada con `BookingAgency_Frontend_V2`.
- [x] Registrar iconos CoreUI en la app.
- [x] Crear layout `admin-layout` con sidebar/header/footer.
- [x] Migrar el admin a rutas por seccion.

### Fase 2. UX real del dashboard

- [x] Reemplazar el nav secundario de botones dentro del dashboard por breadcrumbs o tabs CoreUI.
- [x] Separar cada seccion en pagina hija para evitar que siempre cargue todo el estado.
- [~] Usar componentes CoreUI de tablas, formularios y cards donde aporte valor real.
- [x] Reutilizar el toast existente del portfolio para feedback de acciones admin.
- [ ] Añadir modals consistentes para confirmar o editar acciones sensibles.

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
