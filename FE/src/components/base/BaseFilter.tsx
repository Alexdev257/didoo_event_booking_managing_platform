import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search, Tag, Calendar, SlidersHorizontal } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Slider } from '@/components/ui/slider'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'dateRange' | 'numberRange'

export interface FilterOption {
    label: string
    value: string | number
}

export interface FilterConfig {
    key: string
    label: string
    type: FilterType
    placeholder?: string
    options?: FilterOption[]
    defaultValue?: string | number
    className?: string // col-span-2 etc
    /** Cho type dateRange: [startKey, endKey] ví dụ ["startTime", "endTime"] */
    rangeKeys?: [string, string]
    /** Cho type dateRange: 'range' = lịch khoảng, 'separate' = 2 ô riêng. Mặc định 'range' */
    dateRangeVariant?: 'range' | 'separate'
    /** Cho type numberRange: nhãn cho ô từ và đến, ví dụ ["Giá từ (đ)", "Giá đến (đ)"] */
    rangeLabels?: [string, string]
    /** Cho type numberRange: 'inputs' = 2 ô, 'slider' = thanh trượt 2 núm. Mặc định 'inputs' */
    numberRangeVariant?: 'inputs' | 'slider'
    /** Cho numberRange slider: min, max, step. Mặc định 0, 10000000, 10000 */
    rangeMin?: number
    rangeMax?: number
    rangeStep?: number
}

interface BaseFilterProps {
    filters: FilterConfig[]
    onFilterChange?: (key: string, value: any) => void
    defaultValues?: Record<string, any>
}

export default function BaseFilter({ filters, onFilterChange }: BaseFilterProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [localState, setLocalState] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {}
        filters.forEach(filter => {
            if (filter.type === 'text' || filter.type === 'number') {
                initialState[filter.key] = (searchParams.get(filter.key) || (filter.defaultValue as string)) ?? ''
            }
            if (filter.type === 'numberRange' && filter.rangeKeys) {
                filter.rangeKeys.forEach(k => {
                    initialState[k] = searchParams.get(k) ?? ''
                })
            }
        })
        return initialState
    })

    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === undefined) {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, String(value))
                }
            })

            if (params.page === undefined && params.pageNumber === undefined) {
                newSearchParams.delete('page')
                newSearchParams.set('pageNumber', '1')
            }

            return newSearchParams.toString()
        },
        [searchParams]
    )

    const updateURL = (key: string, value: string | null) => {
        router.push(pathname + '?' + createQueryString({ [key]: value }))
        if (onFilterChange) {
            onFilterChange(key, value)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams.toString())
            let hasChange = false
            Object.keys(localState).forEach(key => {
                const currentParam = searchParams.get(key) || ''
                const localVal = localState[key] ?? ''
                if (localVal !== currentParam) {
                    hasChange = true
                    if (localVal) newParams.set(key, localVal)
                    else newParams.delete(key)
                }
            })
            if (hasChange) {
                newParams.set('pageNumber', '1')
                router.push(pathname + '?' + newParams.toString())
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [localState])

    const handleValuesChange = (key: string, value: string) => {
        const filterDef = filters.find(f => f.key === key)
        if (filterDef?.type === 'text' || filterDef?.type === 'number') {
            setLocalState(prev => ({ ...prev, [key]: value }))
        } else if (filterDef?.type === 'numberRange' && filterDef.rangeKeys?.includes(key)) {
            setLocalState(prev => ({ ...prev, [key]: value }))
        } else {
            updateURL(key, value)
        }
    }

    const clearFilters = () => {
        router.push(pathname)
        const resetState: Record<string, string> = {}
        filters.forEach(filter => {
            if (filter.type === 'text' || filter.type === 'number') {
                resetState[filter.key] = ''
            }
            if (filter.type === 'numberRange' && filter.rangeKeys) {
                filter.rangeKeys.forEach(k => { resetState[k] = '' })
            }
        })
        setLocalState(resetState)
    }

    const getIconForFilter = (key: string) => {
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('search')) return Search
        if (key.toLowerCase().includes('category')) return Tag
        if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) return Calendar
        return Search
    }

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm mb-6 border border-border">
            <div className="flex flex-col lg:flex-row items-end gap-4">
                {/* Mobile Filter Toggle */}
                <div className="flex lg:hidden w-full items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider">Bộ lọc</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="text-primary font-bold text-xs"
                    >
                        {showMobileFilters ? "Thu gọn" : "Mở bộ lọc"}
                    </Button>
                </div>

                <div className={cn(
                    "flex-1 w-full flex flex-wrap gap-4",
                    !showMobileFilters && "hidden lg:flex"
                )}>
                    {filters.map((filter) => {
                        const isSeparateDate = filter.type === 'dateRange' && filter.dateRangeVariant === 'separate';
                        // Basis for 5 columns on lg: calc(20% - gap_offset)
                        // Basis for separate date range (2 columns): calc(40% - gap_offset)
                        const flexClass = isSeparateDate 
                            ? "lg:basis-[calc(40%-1rem)]" 
                            : "lg:basis-[calc(20%-1rem)]";

                        if (filter.type === 'numberRange' && filter.rangeKeys) {
                            const [fromKey, toKey] = filter.rangeKeys
                            const variant = filter.numberRangeVariant ?? 'inputs'
                            const min = filter.rangeMin ?? 0
                            const max = filter.rangeMax ?? 10_000_000
                            const step = filter.rangeStep ?? 10_000

                            const fromVal = localState[fromKey] ?? searchParams.get(fromKey) ?? ''
                            const toVal = localState[toKey] ?? searchParams.get(toKey) ?? ''
                            const fromNum = Math.min(max, Math.max(min, Number(fromVal) || min))
                            const toNum = Math.min(max, Math.max(min, Number(toVal) || max))
                            const sliderValue: [number, number] = [fromNum, toNum]

                            if (variant === 'slider') {
                                const hasFilter = (fromVal && Number(fromVal) > min) || (toVal && Number(toVal) < max)
                                return (
                                    <div key={filter.key} className={cn("flex-grow space-y-2 min-w-[180px]", flexClass, filter.className)}>
                                        <Label className="text-sm font-medium text-foreground">{filter.label}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal min-h-[40px]",
                                                        !hasFilter && "text-muted-foreground"
                                                    )}
                                                >
                                                    <SlidersHorizontal className="h-4 w-4 shrink-0" />
                                                    <span className="ml-2 truncate">
                                                        {hasFilter
                                                            ? `${sliderValue[0].toLocaleString('vi-VN')}đ - ${sliderValue[1].toLocaleString('vi-VN')}đ`
                                                            : filter.label}
                                                    </span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-4" align="start">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Label className="text-sm font-medium text-foreground">{filter.label}</Label>
                                                        <span className="text-sm text-muted-foreground">
                                                            {sliderValue[0].toLocaleString('vi-VN')}đ - {sliderValue[1].toLocaleString('vi-VN')}đ
                                                        </span>
                                                    </div>
                                                    <Slider
                                                        value={sliderValue}
                                                        onValueChange={([a, b]) => {
                                                            setLocalState(prev => ({
                                                                ...prev,
                                                                [fromKey]: String(a),
                                                                [toKey]: String(b),
                                                            }))
                                                        }}
                                                        min={min}
                                                        max={max}
                                                        step={step}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )
                            }

                            const [fromLabel, toLabel] = filter.rangeLabels ?? ['Từ', 'Đến']
                            return (
                                <div key={filter.key} className={cn("flex flex-col sm:flex-row gap-4 flex-grow min-w-[140px]", flexClass, filter.className)}>
                                    <div className="flex-1 space-y-2 min-w-[140px]">
                                        <Label className="text-sm font-medium text-foreground">{fromLabel}</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={fromVal}
                                            onChange={(e) => handleValuesChange(fromKey, e.target.value)}
                                            className="w-full"
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-[140px]">
                                        <Label className="text-sm font-medium text-foreground">{toLabel}</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={toVal}
                                            onChange={(e) => handleValuesChange(toKey, e.target.value)}
                                            className="w-full"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        if (filter.type === 'dateRange' && filter.rangeKeys) {
                            const [startKey, endKey] = filter.rangeKeys
                            const variant = filter.dateRangeVariant ?? 'range'
                            const startVal = searchParams.get(startKey) ?? ''
                            const endVal = searchParams.get(endKey) ?? ''

                            if (variant === 'separate') {
                                return (
                                    <div key={filter.key} className={cn("flex flex-col sm:flex-row gap-4 flex-grow", flexClass, filter.className)}>
                                        <div className="flex-1 space-y-2 min-w-[140px]">
                                            <Label className="text-sm font-medium text-foreground">Từ ngày</Label>
                                            <Input
                                                type="date"
                                                value={startVal}
                                                onChange={(e) => {
                                                    const newParams = new URLSearchParams(searchParams.toString())
                                                    if (e.target.value) newParams.set(startKey, e.target.value)
                                                    else newParams.delete(startKey)
                                                    newParams.set('pageNumber', '1')
                                                    router.push(pathname + '?' + newParams.toString())
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2 min-w-[140px]">
                                            <Label className="text-sm font-medium text-foreground">Đến ngày</Label>
                                            <Input
                                                type="date"
                                                value={endVal}
                                                onChange={(e) => {
                                                    const newParams = new URLSearchParams(searchParams.toString())
                                                    if (e.target.value) newParams.set(endKey, e.target.value)
                                                    else newParams.delete(endKey)
                                                    newParams.set('pageNumber', '1')
                                                    router.push(pathname + '?' + newParams.toString())
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )
                            }

                            const rangeValue: DateRange | undefined =
                                startVal && endVal
                                    ? { from: new Date(startVal), to: new Date(endVal) }
                                    : startVal
                                        ? { from: new Date(startVal), to: undefined }
                                        : undefined

                            const handleRangeChange = (r: DateRange | undefined) => {
                                const newParams = new URLSearchParams(searchParams.toString())
                                if (r?.from) {
                                    newParams.set(startKey, format(r.from, 'yyyy-MM-dd'))
                                } else {
                                    newParams.delete(startKey)
                                }
                                if (r?.to) {
                                    newParams.set(endKey, format(r.to, 'yyyy-MM-dd'))
                                } else {
                                    newParams.delete(endKey)
                                }
                                newParams.set('pageNumber', '1')
                                router.push(pathname + '?' + newParams.toString())
                            }

                            return (
                                <div key={filter.key} className={cn("flex-grow space-y-2 min-w-[200px]", flexClass, filter.className)}>
                                    <Label className="text-sm font-medium text-foreground">{filter.label}</Label>
                                    <DateRangePicker
                                        value={rangeValue}
                                        onChange={handleRangeChange}
                                        placeholder={filter.placeholder ?? "Từ ngày - Đến ngày"}
                                    />
                                </div>
                            )
                        }

                        const paramValue = searchParams.get(filter.key)
                        const value = (filter.type === 'text' || filter.type === 'number')
                            ? (localState[filter.key] !== undefined ? localState[filter.key] : (paramValue || ''))
                            : (paramValue ?? filter.defaultValue ?? '')

                        return (
                            <div key={filter.key} className={cn("flex-grow space-y-2 min-w-[140px]", flexClass, filter.className)}>
                                <Label className="text-sm font-medium text-foreground">{filter.label}</Label>

                                {filter.type === 'text' && (
                                    <Input
                                        type="text"
                                        placeholder={filter.placeholder}
                                        value={value}
                                        onChange={(e) => handleValuesChange(filter.key, e.target.value)}
                                        className="w-full"
                                    />
                                )}

                                {filter.type === 'select' && (
                                    <Select
                                        value={value === '' || value === undefined ? 'all' : String(value)}
                                        onValueChange={(v) => handleValuesChange(filter.key, v === 'all' ? '' : v)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filter.options?.map((opt) => (
                                                <SelectItem
                                                    key={String(opt.value)}
                                                    value={opt.value === '' || opt.value === undefined ? 'all' : String(opt.value)}
                                                >
                                                    {opt.label}
                                                    </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {filter.type === 'date' && (
                                    <Input
                                        type="date"
                                        value={value}
                                        onChange={(e) => handleValuesChange(filter.key, e.target.value)}
                                        className="w-full"
                                    />
                                )}

                                {filter.type === 'number' && (
                                    <Input
                                        type="number"
                                        placeholder={filter.placeholder}
                                        value={value}
                                        onChange={(e) => handleValuesChange(filter.key, e.target.value)}
                                        className="w-full"
                                        min={0}
                                    />
                                )}
                            </div>
                        )
                    })}

                    <Button
                        variant="secondary"
                        onClick={clearFilters}
                        className={cn(
                            "lg:basis-[calc(20%-1rem)] flex-grow h-[40px] mt-auto transition-all",
                            showMobileFilters ? "w-full" : "hidden lg:flex"
                        )}
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </div>
        </div>
    )
}
