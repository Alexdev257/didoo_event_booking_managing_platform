import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    className?: string;
    // Thêm tùy chọn màu sắc
    variant?: "default" | "primary" | "danger" | "warning" | "success" | "purple";
}

export const SectionHeader = ({
    title,
    subtitle,
    icon: Icon,
    className,
    variant = "default"
}: SectionHeaderProps) => {

    // Định nghĩa bảng màu dựa trên variant
    const variantStyles = {
        default: "text-foreground",
        primary: "text-blue-600 dark:text-blue-400",
        danger: "text-red-600 dark:text-red-400",    // Cho Trending/Hot
        warning: "text-amber-500 dark:text-amber-400", // Cho Special/Sparkles
        success: "text-emerald-600 dark:text-emerald-400",
        purple: "text-purple-600 dark:text-purple-400", // Cho "For You"
    };

    const iconStyles = {
        default: "text-primary",
        primary: "bg-blue-500/10 text-blue-600",
        danger: "bg-red-500/10 text-red-600",
        warning: "bg-amber-500/10 text-amber-500",
        success: "bg-emerald-500/10 text-emerald-600",
        purple: "bg-purple-500/10 text-purple-600",
    };

    return (
        <div className={cn("mb-10 flex items-end justify-between group", className)}>
            <div className="space-y-3">
                <h2 className={cn(
                    "text-3xl md:text-5xl font-black tracking-tight leading-none flex items-center gap-4",
                    variantStyles[variant] // Áp dụng màu cho Title
                )}>
                    {Icon && (
                        <div className={cn(
                            "p-2.5 md:p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                            iconStyles[variant] // Áp dụng màu cho Icon Box
                        )}>
                            <Icon className="w-7 h-7 md:w-9 md:h-9" />
                        </div>
                    )}
                    <span className="bg-clip-text">
                        {title}
                    </span>
                </h2>
                {subtitle && (
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};