"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ChartContainer,
} from "@/components/ui/chart"
import { useDataStore } from "@/lib/data-store"

export function CustomerDistributionChart() {
  const { customerDistribution, hasData } = useDataStore()

  if (!hasData()) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-muted/20 dark:bg-black/20 border border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground">No data available. Please upload a dataset.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={customerDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "currentColor" }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              width={80}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(230, 0, 18, 0.1)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md dark:bg-black/90 backdrop-blur-sm">
                      <div className="font-medium mb-1">Purchase Range: {payload[0].payload.range}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Customer Count:</div>
                        <div className="text-sm font-medium text-right">{payload[0].value}</div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" fill="#E60012" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="mt-4 text-sm text-muted-foreground">
        This histogram shows the distribution of customers by their purchase frequency. Each bar represents the number
        of customers who made purchases within that range.
      </p>
    </div>
  )
}

