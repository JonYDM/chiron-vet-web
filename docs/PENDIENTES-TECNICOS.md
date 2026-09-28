# Pendientes técnicos — backlog de ingeniería

> Cuestiones técnicas detectadas durante el rediseño (base Stitch) para iterar con
> contexto general: librerías/componentes que faltan en el frontend y features/lógica
> que requiere el backend. Complementa a `REDISENO-STITCH.md` (bitácora de UI) y
> `DESIGN-SYSTEM.md` (sistema visual estable).

## Frontend — librerías / componentes a incorporar
- **Gráficas / charts (métricas):** el dashboard muestra métricas (ventas, citas) que
  pedirían gráficas de barras/líneas. Evaluar **Recharts** (o visx / Chart.js). Recharts
  es el más simple para React + buen encaje con tokens. Uso: barra de ventas por día,
  distribución por método de pago, tendencia de citas.
- **Barras de progreso / medidores:** hoy la barra tricolor de "Citas del Día" está hecha
  con divs. Si se vuelve recurrente, extraer un componente `ProgressBar`/`Meter`.
- **Galería / lightbox de fotos:** el perfil de paciente tiene collage; para verlas en
  grande evaluar un lightbox ligero (o construirlo con el Modal existente).
- **Carga/compresión de imagen en cliente:** al subir foto de mascota, comprimir con
  `<canvas>` antes de mandar (reduce datos del celular). Ver PR backend de fotos (R2).

### Patrones de UI (animación / movimiento)
- **Collapsing header (estilo iOS "large title"):** el título grande de la pantalla se
  encoge y se funde con el header fijo al hacer scroll. Técnicas:
  - **Scroll-driven animations** CSS puro (`animation-timeline: scroll()` / `view()`) —
    elegante, sin JS, pero soporte parcial (Chrome/Edge sí; Safari/Firefox aún no del todo).
  - **IntersectionObserver** (JS) — soporte universal; detecta cuándo el título grande sale
    de vista y lo muestra en el header. **Elegido** por compatibilidad.
  - Implementado como componente reutilizable `<PantallaConHeader titulo="...">`.
  - NO confundir con **View Transitions API** (transición entre rutas/estados, "shared
    element"), que la app ya usa en `lib/useNavegarConTransicion.ts`.

## Backend — features / lógica pendiente (para próximos PRs de `chiron`)

- **Identificar usuario antes del PIN (login estilo Nubank):** endpoint público
  `POST /auth/identificar { identificador }` → `{ existe: bool, nombre?: string }`.
  Permite validar el usuario y saludarlo por su nombre real antes de pedir el PIN.
  - **Nota de seguridad:** habilita enumeración de usuarios. Mitigar con **rate-limiting**
    y devolviendo solo el primer nombre (no datos sensibles). Para app interna es
    aceptable, pero decidir a conciencia.
  - El frontend YA está preparado: si el endpoint no existe (404/405), hace fallback y
    continúa al PIN sin validar (`identificar()` en `features/auth/api.ts`).

- **Notificaciones in-app (avisos a dueños):** en lugar de integrar WhatsApp/Meta
  (reglas, plantillas aprobadas, costo por mensaje), usar el rol **DuenoMascota** y
  enviarle avisos **dentro del portal**. Requiere:
  - Entidad `Notificacion` (destinatarioUsuarioId, tipo, mensaje, leída, fecha).
  - Endpoint para emitir (individual o masivo/"spam" propio) y para listar/marcar leída.
  - El portal del dueño las muestra (campana + lista).
- **Recordatorios por fecha + enum de tipo:** generar recordatorios automáticos según
  fechas clínicas (próxima vacuna/desparasitación/cita). Requiere:
  - Lógica que calcule "vence en X días" a partir de `fechaProximaAplicacion`.
  - **Enum `TipoRecordatorio`** (Vacuna, Desparasitación, Cita, Revisión…).
  - Job/consulta que liste los pendientes del día (ya existe `GenerarRecordatorios` en
    backend — revisar y conectar con notificaciones in-app).
- **Métricas reales para gráficas:** endpoints que devuelvan series temporales (ventas
  por día del mes, citas por día) para alimentar Recharts, no solo totales.
- **Multi-sucursal:** relación usuario ↔ N veterinarias + cambio de contexto (ver
  REDISENO-STITCH.md §1).
- **Filtros de clientes "Con cita hoy" / "Con adeudo":** hoy son chips [MOCK] en la vista
  Clientes (marcan pero no filtran). Requieren: consulta de clientes con cita en el día
  y un concepto de adeudo/saldo (cuentas por cobrar) que hoy no existe en el POS.
- **Obtener mascota por id (`GET /mascotas/{id}`):** el Perfil de Paciente recibe la mascota
  por router state (al entrar desde Clientes). Al recargar (F5) se pierde el state y falta
  un endpoint para recuperar los datos del paciente por id. La galería y el expediente sí
  cargan por id.
- **Nombre de la veterinaria en la sesión:** hoy el token/login solo trae `veterinariaId`,
  no el nombre. El header muestra la sucursal quemada ("Roma Norte"). Falta incluir el
  nombre de la veterinaria en `LoginResponse`/claims para mostrarlo real.
- **Inventario con lotes/caducidad:** para la "alerta farmacéutica" (stock por agotarse,
  lote, refrigerador). Hoy el POS tiene stock simple.
- **Triage / sala de espera:** estado de atención (en espera, en consultorio, urgencia),
  tiempo de espera, asignación de consultorio.
- **Método de pago SPEI:** el desglose de caja muestra SPEI; hoy el POS tiene
  efectivo/tarjeta/transferencia. SPEI con CLABE/QR sería una extensión.
- **Campos clínicos del paciente:** alergias/contraindicaciones (para la "alerta médica
  crítica"), microchip, cédula del veterinario. Algunos ya existen (padecimientos).

## Notas de implementación
- Cualquier dependencia nueva: versión pineada, revisar peso (bundle) y encaje con tokens.
- Priorizar componentes propios sobre librerías pesadas salvo que aporten mucho (charts).
