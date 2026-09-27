import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/organisms/AppShell";
import { navPortal } from "@/app/navigation";

/** Layout del portal del dueño de mascota (/portal/*). */
export function PortalLayout() {
  return (
    <AppShell nav={navPortal} titulo="Portal del dueño">
      <Outlet />
    </AppShell>
  );
}
