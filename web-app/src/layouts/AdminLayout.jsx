import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
