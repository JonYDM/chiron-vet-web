# 🐾 Chiron — Feedback para el Backend (estado de implementación)

> Registro de las mejoras solicitadas durante el desarrollo del frontend y su estado.
> Última actualización: 2026-09-27

---

## Estado general

Casi todo el backlog de mejoras quedó **implementado full-stack** en dos tandas:
- Rama backend `feature/reset-pin` (reset de PIN + gestión de usuarios base) — **PR pendiente**.
- Rama backend `feature/mejoras-mvp` (todo lo demás) — **PR pendiente**.
- Frontend correspondiente **mergeado a `main`** en `chiron-web`.

> El backend va por Pull Request porque `main` está protegida con ruleset. El usuario compila
> con `dotnet build` y mergea los PRs; luego Railway despliega y el frontend queda 100% funcional.

---

## ✅ Implementado

### 1. Reset de PIN (recuperación de acceso)
- `POST /api/usuarios/{id}/resetear-pin`. Admin resetea su staff/dueños; SuperAdmin resetea admins.
- Frontend: pantalla "Equipo", sección Administradores, y botón en la ficha de cliente.

### 2. Gestión de usuarios (listar + editar + activar/desactivar)
- `GET /api/usuarios/staff`, `GET /api/admin/administradores`, `GET /api/clientes/{id}/usuario`.
- `POST /api/usuarios/{id}/gestionar` (editar nombre + activar/desactivar), con autorización por rol.
- Frontend: pantalla "Equipo" (Admin) y sección Administradores (SuperAdmin) con editar/estado.

### 3. Cambiar mi propio PIN (autoservicio)
- `POST /api/mi-pin` (verifica el PIN actual). Cualquier usuario autenticado.
- Frontend: botón "Cambiar mi PIN" en el AppShell.

### 4. Cambiar estado de cita (atender / cancelar / no asistió)
- `POST /api/citas/{id}/estado`. Reusa las transiciones del dominio `Cita`.
- Frontend: botones de acción en cada cita programada.

### 5. Punto de venta ampliado
- Editar producto `PUT /api/productos/{id}`, reabastecer `POST /api/productos/{id}/reabastecer`,
  desactivar `POST /api/productos/{id}/desactivar` (baja lógica, campo `Activo`).
- Historial de ventas `GET /api/veterinarias/{id}/ventas?desde&hasta` y por cliente
  `GET /api/clientes/{id}/ventas`.
- Venta ligada a cliente (opcional) — ya soportado por el `ClienteId` del comando.
- Frontend: editar/reabastecer/baja de producto, selector de cliente en la venta, página de
  historial con **exportación a CSV** (100% cliente).

### 6. Detalle de consulta
- `RegistroMedico` ampliado: `Diagnostico`, `Tratamiento`, `PesoKg`, `TemperaturaC`, `Notas`.
- Frontend: campos en el modal de expediente y su despliegue en el historial.

### 7. Más campos de mascota
- `Mascota` ampliada: `PesoKg`, `Padecimientos`, `Esterilizado` + método `ActualizarDatos`.
- Frontend: modal de mascota (crear/editar) con todos los campos.

### 8. Editar cliente + desacoplar cliente/mascota
- `POST /api/clientes` (solo cliente), `PUT /api/clientes/{id}` (editar),
  `POST /api/mascotas` (agregar a cliente), `PUT /api/mascotas/{id}` (editar).
- Frontend: editar cliente, agregar/editar mascota desde la ficha.

---

## ⚠️ Importante para el despliegue del backend

Al ampliar entidades (`Producto.Activo`, campos de `Mascota` y `RegistroMedico`) se agregaron
**columnas nuevas**. En PostgreSQL hace falta **generar y aplicar una migración de EF Core**:

```bash
cd src/Chiron.Infrastructure   # o donde corresponda
dotnet ef migrations add MejorasMvp --startup-project ../Chiron.Api
dotnet ef database update --startup-project ../Chiron.Api
```

(En modo en memoria no hace falta.) Las migraciones automáticas del `Program.cs` aplicarán la
migración al desplegar si el proyecto la incluye.

---

## ⏳ Pendiente (siguiente iteración)

### Código QR por mascota (diferenciador ⭐)
- Backend: `TokenPublico` (Guid) en `Mascota` + `GET /api/mascotas/token/{token}` +
  opcional `GET /api/mascotas/{id}/resumen` (métricas).
- Frontend: generar QR (lib `qrcode`), escanear (cámara + `@zxing/browser`), ruta `/m/:token`.

### Otros
- Notificaciones push web (PWA + Web Push) — requiere endpoint de suscripciones.
- Integración real de WhatsApp (feature futura).
- Métricas/dashboard con datos reales (totales, próximos, etc.).
