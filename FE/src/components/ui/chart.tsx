"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }
>;

const ChartContext = React.createContext<ChartConfig | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) return {};
  return context;
}

function ChartStyle({ config }: { config: ChartConfig }) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([, config]) => config?.color)
          .map(([key, config]) => `--color-${key}: ${config?.color};`)
          .join("\n"),
      }}
    />
  );
}

export interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, ...props }, ref) => {
    const id = React.useId();
    return (
      <ChartContext.Provider value={config}>
        <div
          data-chart-container
          ref={ref}
          className={className}
          style={{ minHeight: 200, ...props.style }}
          {...props}
        >
          <ChartStyle config={config} />
          <ResponsiveContainer width="100%" height="100%" id={id}>
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; dataKey?: string; color?: string; payload?: Record<string, unknown> }>;
  label?: string;
  labelFormatter?: (label: string) => React.ReactNode;
  nameFormatter?: (name: string, value: number) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  nameFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      {label && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{entry.name ?? entry.dataKey}</span>
            <span className="font-medium text-foreground">
              {nameFormatter ? nameFormatter(entry.name ?? "", entry.value ?? 0) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
