import { useState } from "react";
import { PawPrint } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { PinPad } from "@/components/molecules/PinPad";

/**
 * Showcase temporal del design system (F0.2). Valida tokens, átomos y la
 * molécula PinPad. Se reemplaza por el Router + login en Sprint 1.
 */
export default function App() {
  const [pin, setPin] = useState("");

  return (
    <main className="mx-auto grid min-h-full max-w-md gap-5 p-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <PawPrint className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Chiron</h1>
          <p className="text-sm text-ink-soft">Design system · F0.2</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Componentes base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Peligro</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="primary">Programada</Badge>
            <Badge tone="success">Atendida</Badge>
            <Badge tone="warning">Vacuna próxima</Badge>
            <Badge tone="danger">Cancelada</Badge>
          </div>
          <Input label="Usuario o teléfono" placeholder="ej: admindemo" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PIN de acceso</CardTitle>
        </CardHeader>
        <CardContent className="grid place-items-center">
          <PinPad value={pin} onChange={setPin} onComplete={() => undefined} />
        </CardContent>
      </Card>
    </main>
  );
}
