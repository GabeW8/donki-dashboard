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

export function RecommendedProductsChart() {
  const { recommendedProducts, hasData } = useDataStore()

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
          <BarChart data={recommendedProducts} margin={{ top: 10, right: 30, left: 0, bottom: 65 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              width={80}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 102, 179, 0.1)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md dark:bg-black/90 backdrop-blur-sm">
                      <div className="font-medium mb-1">{payload[0].name}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-muted-foreground">Recommendation Score:</div>
                        <div className="text-sm font-medium text-right">{payload[0].value}</div>
                      </div>
                      {payload[0].payload.category && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Category: {payload[0].payload.category}
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="value" fill="#0066B3" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="mt-4 text-sm text-muted-foreground">
        This chart shows the top 10 most frequently recommended products across all customers based on collaborative
        filtering. The value represents the recommendation score.
      </p>
    </div>
  )
}

