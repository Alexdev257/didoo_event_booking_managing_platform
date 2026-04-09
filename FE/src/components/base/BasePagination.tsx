'use client';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from "@/lib/utils";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    showInfo?: boolean;
    showSizeSelector?: boolean;
    showNavigation?: boolean;
}

export function BasePagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 15, 20, 50],
    showInfo = true,
    showSizeSelector = true,
    showNavigation = true,
}: BasePaginationProps) {
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={cn("flex items-center gap-4", (!showInfo && !showSizeSelector) ? "justify-center" : (showInfo || showSizeSelector) && showNavigation ? "justify-between w-full" : "justify-end")}>
            {/* Info text & Size selector - Left side */}
            {(showInfo || (showSizeSelector && onPageSizeChange)) && (
                <div className="flex items-center gap-4">
                    {showInfo && totalItems !== undefined && itemsPerPage !== undefined && totalItems > 0 && (
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                            Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
                        </p>
                    )}
                    {showSizeSelector && onPageSizeChange && itemsPerPage !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">Số dòng:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(val) => onPageSizeChange(Number(val))}
                            >
                                <SelectTrigger className="h-9 w-[70px] bg-card border-border rounded-xl focus:ring-1 focus:ring-primary font-medium">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border shadow-xl">
                                    {pageSizeOptions.map((size) => (
                                        <SelectItem key={size} value={size.toString()} className="text-xs font-medium">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination - Right side (conditionally rendered) */}
            {showNavigation && (
                <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
                                }}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {generatePageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                                {page === '...' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (onPageChange) onPageChange(page as number);
                                        }}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
