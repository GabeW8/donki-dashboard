"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types for our data based on the actual CSV schema
export interface Transaction {
  TransactionID: string
  CustomerID: string
  ProductID: string
  ProductCategory: string
  PurchaseCount: number
  Price: number
  TotalAmount: number
  Timestamp: string
  StoreID: string
  CustomerSegment: string
  PaymentMethod: string
  PromotionCode: string
}

interface Customer {
  id: string
  name: string
  segment: string
}

interface Product {
  id: string
  name: string
  value: number
  category?: string
}

interface CustomerDistribution {
  range: string
  count: number
}

interface ProductRecommendation {
  id: string
  name: string
  confidence: number
  image: string
  category?: string
}

interface DataStoreState {
  // Raw data
  transactions: Transaction[]

  // Processed data
  topProducts: Product[]
  customerDistribution: CustomerDistribution[]
  recommendedProducts: Product[]
  customers: Customer[]
  customerRecommendations: Record<string, ProductRecommendation[]>

  // Metadata
  lastUpdated: string | null

  // Actions
  updateData: (transactions: Transaction[]) => void
  hasData: () => boolean
}

// Product images mapping (for recommendations)
const productImages: Record<string, string> = {
  Bento: "https://images.unsplash.com/photo-1530260626688-048d70fd1e68?q=80&w=300&auto=format&fit=crop",
  Sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop",
  Ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=300&auto=format&fit=crop",
  Sake: "https://images.unsplash.com/photo-1627436580244-b10f3919e8d4?q=80&w=300&auto=format&fit=crop",
  Matcha: "https://images.unsplash.com/photo-1582793988951-9aed5509eb97?q=80&w=300&auto=format&fit=crop",
  Mochi: "https://images.unsplash.com/photo-1581798459219-318e68f60ae5?q=80&w=300&auto=format&fit=crop",
  Snacks: "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?q=80&w=300&auto=format&fit=crop",
  Tea: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=300&auto=format&fit=crop",
  Wagyu: "https://images.unsplash.com/photo-1603356033288-acfcb54801e6?q=80&w=300&auto=format&fit=crop",
  Kitchenware: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=300&auto=format&fit=crop",
  Stationery: "https://images.unsplash.com/photo-1608389168343-ba8aa0cb3a71?q=80&w=300&auto=format&fit=crop",
  Beauty: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop",
  Anime: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?q=80&w=300&auto=format&fit=crop",
  Manga: "https://images.unsplash.com/photo-1531501410720-c8d437636169?q=80&w=300&auto=format&fit=crop",
}

// Helper function to get a product image
const getProductImage = (productName: string): string => {
  // Try to find an exact match
  if (productImages[productName]) {
    return productImages[productName]
  }

  // Try to find a partial match
  const key = Object.keys(productImages).find((k) => productName.toLowerCase().includes(k.toLowerCase()))

  if (key) {
    return productImages[key]
  }

  // Default image
  return "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=300&auto=format&fit=crop"
}

// Process transactions to get top products
const processTopProducts = (transactions: Transaction[]): Product[] => {
  const productMap = new Map<string, { count: number; category: string }>()

  transactions.forEach((transaction) => {
    const key = transaction.ProductID
    const current = productMap.get(key) || { count: 0, category: transaction.ProductCategory }
    productMap.set(key, {
      count: current.count + transaction.PurchaseCount,
      category: transaction.ProductCategory,
    })
  })

  return Array.from(productMap.entries())
    .map(([id, { count, category }]) => ({
      id,
      name: id,
      value: count,
      category,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

// Process transactions to get customer distribution
const processCustomerDistribution = (transactions: Transaction[]): CustomerDistribution[] => {
  const customerPurchases = new Map<string, number>()

  transactions.forEach((transaction) => {
    const key = transaction.CustomerID
    const current = customerPurchases.get(key) || 0
    customerPurchases.set(key, current + transaction.PurchaseCount)
  })

  const purchaseCounts = Array.from(customerPurchases.values())

  // Define ranges
  const ranges = [
    { min: 1, max: 5, label: "1-5" },
    { min: 6, max: 10, label: "6-10" },
    { min: 11, max: 15, label: "11-15" },
    { min: 16, max: 20, label: "16-20" },
    { min: 21, max: 25, label: "21-25" },
    { min: 26, max: 30, label: "26-30" },
    { min: 31, max: 35, label: "31-35" },
    { min: 36, max: 40, label: "36-40" },
    { min: 41, max: 45, label: "41-45" },
    { min: 46, max: Number.POSITIVE_INFINITY, label: "46+" },
  ]

  // Count customers in each range
  const distribution = ranges.map((range) => {
    const count = purchaseCounts.filter((count) => count >= range.min && count <= range.max).length

    return {
      range: range.label,
      count,
    }
  })

  return distribution
}

// Simple collaborative filtering for product recommendations
const processRecommendations = (transactions: Transaction[]): Product[] => {
  // Group transactions by customer
  const customerPurchases = new Map<string, Set<string>>()

  transactions.forEach((transaction) => {
    const customerId = transaction.CustomerID
    if (!customerPurchases.has(customerId)) {
      customerPurchases.set(customerId, new Set())
    }
    customerPurchases.get(customerId)!.add(transaction.ProductID)
  })

  // Count co-occurrences
  const coOccurrences = new Map<string, number>()
  const productCounts = new Map<string, number>()

  transactions.forEach((t) => {
    const count = productCounts.get(t.ProductID) || 0
    productCounts.set(t.ProductID, count + 1)
  })

  // For each customer
  customerPurchases.forEach((products) => {
    // For each pair of products
    const productArray = Array.from(products)
    for (let i = 0; i < productArray.length; i++) {
      for (let j = i + 1; j < productArray.length; j++) {
        const pair = [productArray[i], productArray[j]].sort().join("|")
        const count = coOccurrences.get(pair) || 0
        coOccurrences.set(pair, count + 1)
      }
    }
  })

  // Calculate recommendation scores
  const recommendationScores = new Map<string, number>()

  coOccurrences.forEach((count, pair) => {
    const [product1, product2] = pair.split("|")

    // Update score for product1
    const score1 = recommendationScores.get(product1) || 0
    recommendationScores.set(product1, score1 + count)

    // Update score for product2
    const score2 = recommendationScores.get(product2) || 0
    recommendationScores.set(product2, score2 + count)
  })

  // Convert to array and sort
  return Array.from(recommendationScores.entries())
    .map(([id, value]) => {
      const transaction = transactions.find((t) => t.ProductID === id)
      return {
        id,
        name: id,
        value,
        category: transaction?.ProductCategory,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

// Extract unique customers from transactions
const extractCustomers = (transactions: Transaction[]): Customer[] => {
  const customerMap = new Map<string, { segment: string }>()

  transactions.forEach((transaction) => {
    if (!customerMap.has(transaction.CustomerID)) {
      customerMap.set(transaction.CustomerID, {
        segment: transaction.CustomerSegment,
      })
    }
  })

  return Array.from(customerMap.entries())
    .map(([id, { segment }]) => ({
      id,
      name: `Customer ${id}`,
      segment,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

// Generate personalized recommendations for each customer
const generateCustomerRecommendations = (
  transactions: Transaction[],
  customers: Customer[],
): Record<string, ProductRecommendation[]> => {
  const recommendations: Record<string, ProductRecommendation[]> = {}

  // For each customer
  customers.forEach((customer) => {
    // Get products this customer has purchased
    const customerProducts = new Set(transactions.filter((t) => t.CustomerID === customer.id).map((t) => t.ProductID))

    // Get products other customers have purchased
    const otherCustomerTransactions = transactions.filter((t) => t.CustomerID !== customer.id)

    // Count how many times each product appears in other customers' transactions
    const productCounts = new Map<string, number>()

    otherCustomerTransactions.forEach((transaction) => {
      if (!customerProducts.has(transaction.ProductID)) {
        const count = productCounts.get(transaction.ProductID) || 0
        productCounts.set(transaction.ProductID, count + 1)
      }
    })

    // Convert to array, sort, and take top 3
    const topRecommendations = Array.from(productCounts.entries())
      .map(([id, count]) => {
        const transaction = transactions.find((t) => t.ProductID === id)
        return {
          id,
          name: id,
          count,
          category: transaction?.ProductCategory,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    // Calculate confidence scores (normalize to 0.8-0.95 range)
    const maxCount = Math.max(...topRecommendations.map((r) => r.count))
    const minCount = Math.min(...topRecommendations.map((r) => r.count))

    const normalizedRecommendations = topRecommendations.map((rec) => {
      let confidence = 0.8

      if (maxCount !== minCount) {
        confidence = 0.8 + ((rec.count - minCount) / (maxCount - minCount)) * 0.15
      }

      return {
        id: rec.id,
        name: rec.name,
        confidence,
        image: getProductImage(rec.name),
        category: rec.category,
      }
    })

    recommendations[customer.id] = normalizedRecommendations
  })

  return recommendations
}

export const useDataStore = create<DataStoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      topProducts: [],
      customerDistribution: [],
      recommendedProducts: [],
      customers: [],
      customerRecommendations: {},
      lastUpdated: null,

      updateData: (transactions: Transaction[]) => {
        const customers = extractCustomers(transactions)
        const topProducts = processTopProducts(transactions)
        const customerDistribution = processCustomerDistribution(transactions)
        const recommendedProducts = processRecommendations(transactions)
        const customerRecommendations = generateCustomerRecommendations(transactions, customers)

        set({
          transactions,
          topProducts,
          customerDistribution,
          recommendedProducts,
          customers,
          customerRecommendations,
          lastUpdated: new Date().toISOString(),
        })
      },

      hasData: () => {
        return get().transactions.length > 0
      },
    }),
    {
      name: "donki-dashboard-storage",
    },
  ),
)

