import {Button} from "@/components/ui/button.tsx";
import { IconBrightness } from "@tabler/icons-react"
import {useTheme} from "@/components/common/ThemeProvider.tsx";

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="secondary"
            size="icon"
            className="group/toggle size-8"
            onClick={toggleTheme}
        >
            <IconBrightness />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
