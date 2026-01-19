import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { ScrollArea } from "./ui/scroll-area";

export default function Layout({ children }: any) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      <SidebarInset className="h-[calc(100vh-var(--spacing)*12)]">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
