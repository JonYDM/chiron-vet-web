import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/organisms/AppShell";
import { navStaff } from "@/app/navigation";

/** Layout del área de staff (/app/*). */
export function StaffLayout() {
  return (
    <AppShell nav={navStaff} titulo="Panel de staff">
      <Outlet />
    </AppShell>
  );
}
