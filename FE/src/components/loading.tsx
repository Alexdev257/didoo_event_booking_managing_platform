import { Spinner } from "./ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingProps {
    className?: string;
    fullScreen?: boolean;
    text?: string;
}

const Loading = ({ className, fullScreen = false, text }: LoadingProps) => {
    return (
        <div className={cn(
            "flex items-center justify-center z-50",
            fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm" : "w-full h-full min-h-[100px]",
            className
        )}>
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Spinner className="size-8" />
                {text && <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{text}</p>}
            </div>
        </div>
    );
}

export default Loading;