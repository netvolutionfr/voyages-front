import {IconLoader} from "@tabler/icons-react";

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-32">
            <IconLoader className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
    )
}

export default LoadingSpinner;
