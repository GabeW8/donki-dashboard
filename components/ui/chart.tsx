"use client"

import type React from "react"

import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Legend as RechartsLegend,
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
} from "recharts"

export const Bar = RechartsBar
export const BarChart = RechartsBarChart
export const CartesianGrid = RechartsCartesianGrid
export const ResponsiveContainer = RechartsResponsiveContainer
export const Tooltip = RechartsTooltip
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis
export const Line = RechartsLine
export const LineChart = RechartsLineChart
export const Legend = RechartsLegend
export const Area = RechartsArea
export const AreaChart = RechartsAreaChart
export const PieChart = RechartsPieChart
export const Pie = RechartsPie
export const Cell = RechartsCell

// Chart container component for consistent styling
export function ChartContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full h-[400px] ${className || ""}`}>{children}</div>
}

