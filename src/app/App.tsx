import { PawPrint } from "lucide-react";

/**
 * App raíz. Por ahora es una pantalla de arranque que valida el scaffolding
 * (Tailwind, tokens de la paleta, fuente e iconos). En Sprint 1 se reemplaza
 * por el Router + providers.
 */
export default function App() {
  return (
    <main className="grid min-h-full place-items-center p-6">
      <div className="animate-fade-in-up rounded-2xl bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-surface">
          <PawPrint className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-ink">Chiron</h1>
        <p className="mt-1 text-ink-soft">
          Gestión simple para veterinarias 🐾
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          Scaffolding listo — Sprint 0 · F0.1
        </p>
      </div>
    </main>
  );
}
