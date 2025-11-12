import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <DropdownMenuItem
      className="flex items-center gap-2  px-2 py-1.5 outline-0 rounded-sm focus:bg-accent focus:text-accent-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-yellow-500" />
          <span className="text-sm ">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-blue-500" />
          <span className="text-sm ">Dark Mode</span>
        </>
      )}
    </DropdownMenuItem>
  );
}
