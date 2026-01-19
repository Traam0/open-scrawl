import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconMoon2 } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export function SiteHeader({ title }: { title: string }) {
  const { setTheme, theme } = useTheme();
  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={toggle}
            variant="ghost"
            size={"icon"}
            className="hidden sm:flex cursor-pointer"
          >
            <IconMoon2 size={24} />
            <span className="sr-only">toggle theme</span>
          </Button>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/Traam0/open-scrawl"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
