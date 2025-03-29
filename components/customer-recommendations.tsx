"use client"

import { useState } from "react"
import Image from "next/image"
import { Tag, ShoppingBag, Percent } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/lib/data-store"

export function CustomerRecommendations() {
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const { customers, customerRecommendations, hasData } = useDataStore()

  if (!hasData()) {
    return (
      <div className="rounded-xl border border-dashed border-donki-yellow/30 p-8 text-center dark:border-donki-yellow/20 bg-muted/20 dark:bg-black/20">
        <p className="text-muted-foreground">No data available. Please upload a dataset.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="border-donki-yellow/30 focus:ring-donki-yellow/30 dark:border-donki-yellow/20 dark:bg-black/40 h-12 rounded-lg">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-900 rounded-lg">
            {customers.map((customer) => (
              <SelectItem
                key={customer.id}
                value={customer.id}
                className="focus:bg-donki-yellow/20 dark:focus:bg-donki-yellow/10"
              >
                <div className="flex items-center">
                  <span>
                    {customer.name} ({customer.id})
                  </span>
                  <Badge variant="outline" className="ml-2 bg-muted/50 dark:bg-black/30 text-xs">
                    {customer.segment}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCustomer && customerRecommendations[selectedCustomer] && (
        <div className="animate-fade-in">
          <h3 className="mb-4 text-xl font-bold flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-donki-yellow" />
            Top 3 Recommendations for {customers.find((c) => c.id === selectedCustomer)?.name}
            <Badge variant="outline" className="ml-3 bg-muted/50 dark:bg-black/30">
              {customers.find((c) => c.id === selectedCustomer)?.segment}
            </Badge>
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {customerRecommendations[selectedCustomer].map((product, index) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-donki-yellow/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,204,51,0.3)] dark:border-donki-yellow/10 dark:bg-black/20 rounded-xl card-hover-effect"
              >
                <CardHeader className="p-4 bg-gradient-to-r from-donki-yellow/5 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
                  <div className="flex justify-between items-center mb-2">
                    <Badge className="bg-donki-yellow text-black hover:bg-donki-yellow/80 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {product.id}
                    </Badge>
                    <Badge variant="outline" className="bg-black/10 dark:bg-white/10">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  {product.category && <p className="text-xs text-muted-foreground mt-1">{product.category}</p>}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-square w-full overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-gradient-to-r from-transparent to-donki-yellow/5 flex justify-between items-center">
                  <div className="text-sm flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-donki-yellow" />
                    <span className="font-medium">Confidence:</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-muted/50 dark:bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-donki-yellow"
                        style={{ width: `${(product.confidence * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="ml-2 text-donki-yellow font-bold dark:text-donki-yellow">
                      {(product.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground bg-muted/20 dark:bg-black/20 p-3 rounded-lg border border-muted">
            These recommendations are based on collaborative filtering and purchase pattern analysis. Products are
            recommended based on similar customer preferences.
          </p>
        </div>
      )}

      {(!selectedCustomer || !customerRecommendations[selectedCustomer]) && (
        <div className="rounded-xl border border-dashed border-donki-yellow/30 p-8 text-center dark:border-donki-yellow/20 bg-muted/20 dark:bg-black/20">
          <p className="text-muted-foreground">Select a customer to view personalized product recommendations</p>
        </div>
      )}
    </div>
  )
}

