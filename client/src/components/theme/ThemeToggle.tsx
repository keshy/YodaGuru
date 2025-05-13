import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="focus-visible:ring-0">
          {theme === "light" && (
            <span className="material-icons">light_mode</span>
          )}
          {theme === "dark" && (
            <span className="material-icons">dark_mode</span>
          )}
          {theme === "spiritual" && (
            <span className="material-icons">auto_awesome</span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <span className="material-icons text-sm mr-2">light_mode</span>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <span className="material-icons text-sm mr-2">dark_mode</span>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("spiritual")}>
          <span className="material-icons text-sm mr-2">auto_awesome</span>
          Spiritual
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}