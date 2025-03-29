"use client"

import { useState, useEffect } from "react"
import { BarChart, FileUp, Moon, ShoppingCart, Sun, Users } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { TopProductsChart } from "@/components/top-products-chart"
import { CustomerDistributionChart } from "@/components/customer-distribution-chart"
import { RecommendedProductsChart } from "@/components/recommended-products-chart"
import { CustomerRecommendations } from "@/components/customer-recommendations"
import { DataUploader } from "@/components/data-uploader"
import { useDataStore } from "@/lib/data-store"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("top-products")
  const [showUploader, setShowUploader] = useState(false)
  const [dataVersion, setDataVersion] = useState(1)
  const { hasData, lastUpdated } = useDataStore()
  const [mounted, setMounted] = useState(false)

  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDataUploaded = () => {
    setShowUploader(false)
    setDataVersion((prev) => prev + 1) // Increment to trigger re-renders of charts
  }

  // Show uploader on first load if no data
  useEffect(() => {
    if (mounted && !hasData()) {
      setShowUploader(true)
    }
  }, [mounted, hasData])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#121212] transition-colors duration-300">
      <header className="sticky top-0 z-10 bg-black dark:bg-black border-b border-donki-yellow/20 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-donki-yellow rounded-full p-1.5">
              <ShoppingCart className="h-5 w-5 text-black" />
            </div>
            <h1 className="text-xl font-bold text-donki-yellow">DON DON: DONKI – Customer Insights</h1>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-donki-yellow/30 text-donki-yellow hover:bg-donki-yellow/10 hover:border-donki-yellow"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-donki-yellow/30 text-donki-yellow hover:bg-donki-yellow/10 hover:border-donki-yellow transition-all duration-200"
              onClick={() => setShowUploader(true)}
            >
              <FileUp className="h-4 w-4" />
              Upload Dataset
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-donki-yellow/20 to-donki-yellow/5 py-3 dark:from-donki-yellow/10 dark:to-transparent border-b border-donki-yellow/10 shadow-sm">
        <div className="container px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Customer Insights</span>
            </div>
            {lastUpdated && (
              <div className="text-xs text-muted-foreground bg-background/50 dark:bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container px-4 py-6 animate-fade-in">
        {showUploader ? (
          <DataUploader onUploaded={handleDataUploaded} onCancel={() => setShowUploader(false)} />
        ) : (
          <Tabs defaultValue="top-products" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-black/5 dark:bg-black/40 p-1 rounded-xl">
              <TabsTrigger
                value="top-products"
                className="flex items-center gap-2 data-[state=active]:bg-donki-yellow data-[state=active]:text-black rounded-lg transition-all duration-200"
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Top 10 Products</span>
                <span className="sm:hidden">Top Products</span>
              </TabsTrigger>
              <TabsTrigger
                value="customer-distribution"
                className="flex items-center gap-2 data-[state=active]:bg-donki-yellow data-[state=active]:text-black rounded-lg transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Customer Distribution</span>
                <span className="sm:hidden">Customers</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommended-products"
                className="flex items-center gap-2 data-[state=active]:bg-donki-yellow data-[state=active]:text-black rounded-lg transition-all duration-200"
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Top Recommended</span>
                <span className="sm:hidden">Recommended</span>
              </TabsTrigger>
              <TabsTrigger
                value="customer-recommendations"
                className="flex items-center gap-2 data-[state=active]:bg-donki-yellow data-[state=active]:text-black rounded-lg transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Per Customer Recommendations</span>
                <span className="sm:hidden">Per Customer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top-products" className="space-y-4 animate-slide-up">
              <Card className="border-donki-yellow/20 shadow-lg dark:border-donki-yellow/10 dark:bg-black/20 overflow-hidden card-hover-effect">
                <CardHeader className="bg-gradient-to-r from-donki-yellow/10 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
                  <CardTitle className="text-2xl font-bold">Top 10 Most Purchased Products</CardTitle>
                  <CardDescription className="text-base">
                    Visualizing the products with the highest total purchases across all customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <TopProductsChart key={`top-products-${dataVersion}`} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer-distribution" className="space-y-4 animate-slide-up">
              <Card className="border-donki-yellow/20 shadow-lg dark:border-donki-yellow/10 dark:bg-black/20 overflow-hidden card-hover-effect">
                <CardHeader className="bg-gradient-to-r from-donki-yellow/10 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
                  <CardTitle className="text-2xl font-bold">Customer Purchase Distribution</CardTitle>
                  <CardDescription className="text-base">
                    Histogram showing how many total purchases were made per customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <CustomerDistributionChart key={`customer-dist-${dataVersion}`} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommended-products" className="space-y-4 animate-slide-up">
              <Card className="border-donki-yellow/20 shadow-lg dark:border-donki-yellow/10 dark:bg-black/20 overflow-hidden card-hover-effect">
                <CardHeader className="bg-gradient-to-r from-donki-yellow/10 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
                  <CardTitle className="text-2xl font-bold">Top Recommended Products</CardTitle>
                  <CardDescription className="text-base">
                    The most frequently recommended products using collaborative filtering
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <RecommendedProductsChart key={`recommended-${dataVersion}`} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer-recommendations" className="space-y-4 animate-slide-up">
              <Card className="border-donki-yellow/20 shadow-lg dark:border-donki-yellow/10 dark:bg-black/20 overflow-hidden card-hover-effect">
                <CardHeader className="bg-gradient-to-r from-donki-yellow/10 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
                  <CardTitle className="text-2xl font-bold">Get Product Recommendations</CardTitle>
                  <CardDescription className="text-base">
                    Select a customer to see their top 3 product recommendations based on purchase history
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <CustomerRecommendations key={`customer-rec-${dataVersion}`} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

