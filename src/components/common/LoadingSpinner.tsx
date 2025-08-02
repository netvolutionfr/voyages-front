import {IconLoader} from "@tabler/icons-react";

export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-32">
            <IconLoader className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
    )
}
