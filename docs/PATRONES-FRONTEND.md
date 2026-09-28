# Patrones del frontend — estado, cache y "actualizar sin refrescar"

> Guía breve de cómo maneja Chiron-web el estado del servidor con **TanStack Query
> (React Query)**. Lo más importante: para que la UI se actualice **sin recargar** tras
> crear/editar/eliminar, hay que **invalidar** las queries afectadas en la mutación.

## 1. El provider (dónde vive el "context" del cache)

- `QueryClientProvider` de TanStack Query se monta en `src/app/providers.tsx` (junto con
  Auth, Toast, Confirm). Es el que guarda el **cache** de todas las queries y permite
  invalidarlas desde cualquier mutación.
- El cliente HTTP (`src/lib/http.ts`) inyecta el token y normaliza errores (401/403).
  Configurado para no reintentar en 401/403.

## 2. Queries (lectura) — `useQuery`

- Cada lectura usa una **queryKey** única y estable. Ejemplos reales:
  - `["clientes", veterinariaId, texto, estado, pagina]`
  - `["mascotas", clienteId]` — mascotas de un cliente
  - `["pacientes", veterinariaId, texto]` — todas las mascotas de la veterinaria
  - `["mascota", mascotaId]` — detalle de una mascota (perfil)
  - `["fotos", mascotaId]` — galería
  - `["expediente", mascotaId]`
- La queryKey es la **identidad** de esos datos en el cache. Invalidar por esa key hace
  que React Query vuelva a pedir los datos y re-renderice.

## 3. Mutaciones (escritura) — `useMutation` + invalidación

**Regla de oro:** al mutar (crear/editar/eliminar), invalida en `onSuccess` **TODAS** las
queries que muestran esos datos. Si olvidas una, esa vista queda desactualizada hasta que
el usuario refresca (bug típico).

Ejemplo — editar mascota afecta 3 vistas, así que invalida las 3:
```ts
export function useEditarMascota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mascotaId, datos }) => editarMascota(mascotaId, datos),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mascotas"] });                    // listas por cliente
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });                   // vista Pacientes
      queryClient.invalidateQueries({ queryKey: ["mascota", variables.mascotaId] });// perfil (detalle)
    },
  });
}
```

**Checklist al crear una mutación nueva:** pregúntate *"¿en qué pantallas se ve este dato?"*
y invalida la queryKey de cada una. Ej.:
- Crear/editar mascota → `mascotas`, `pacientes`, `mascota/{id}`, y `clientes` (por el conteo `totalMascotas`).
- Subir/eliminar foto → `fotos/{id}`.
- Subir foto de perfil → `mascota/{id}`, `pacientes`.

## 4. Patrón de "dato que viaja por router state" (perfil/detalle)

Algunas vistas de detalle (perfil de paciente, detalle de cliente) reciben el objeto por
`navigate(..., { state })` para pintar de inmediato, **y además** consultan el endpoint por
id (`useMascota`) como fuente de verdad. Se prioriza el dato del API sobre el state:
`const dato = datoApi ?? datoState`. Al invalidar `["mascota", id]`, el API refresca y
sobrescribe el state viejo. (Para que esto funcione, el endpoint debe existir; si no,
queda el fallback del state.)

## 5. Errores comunes (evitar)
- **Olvidar invalidar una queryKey** → la vista no se actualiza sin refresh. (El caso más
  frecuente; revisar el checklist de §3.)
- **queryKey inestable** (que cambia en cada render) → refetch infinito.
- Hacer **N peticiones** para datos que el backend puede devolver en una (preferir ampliar
  el DTO, como se hizo con `totalMascotas` y los campos clínicos en `GET /mascotas`).
