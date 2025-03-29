"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, FileUp, Loader2, Upload, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDataStore, type Transaction } from "@/lib/data-store"
import { Progress } from "@/components/ui/progress"

interface DataUploaderProps {
  onUploaded: () => void
  onCancel: () => void
}

export function DataUploader({ onUploaded, onCancel }: DataUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { updateData } = useDataStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)
    setProgress(10)

    try {
      // For the demo, we'll fetch the CSV from the provided URL
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IS215_Dataset%20for%20Project-NqZ2OG3MfA6PApN5kBokK6x6iqWqTg.csv"

      setProgress(30)
      const response = await fetch(csvUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch the CSV file")
      }

      setProgress(50)
      const text = await response.text()
      setProgress(70)

      const result = parseCSV(text)

      if (result.success) {
        setProgress(90)
        updateData(result.data)

        setTimeout(() => {
          setProgress(100)
          setIsUploading(false)
          onUploaded()
        }, 500)
      } else {
        setError(result.error || "Failed to parse CSV file")
        setIsUploading(false)
      }
    } catch (err) {
      setError("An error occurred while processing the file")
      setIsUploading(false)
    }
  }

  const parseCSV = (csvText: string): { success: boolean; data?: Transaction[]; error?: string } => {
    try {
      const lines = csvText.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      // Check if the CSV has the required columns
      const requiredColumns = [
        "TransactionID",
        "CustomerID",
        "ProductID",
        "ProductCategory",
        "PurchaseCount",
        "Price",
        "TotalAmount",
      ]

      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

      if (missingColumns.length > 0) {
        return {
          success: false,
          error: `CSV is missing required columns: ${missingColumns.join(", ")}`,
        }
      }

      // Parse the data
      const transactions: Transaction[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(",").map((v) => v.trim())

        if (values.length !== headers.length) {
          console.warn(`Skipping line ${i + 1}: incorrect number of values`)
          continue
        }

        const transaction: any = {}

        headers.forEach((header, index) => {
          let value = values[index]

          // Convert numeric fields
          if (["PurchaseCount", "Price", "TotalAmount"].includes(header)) {
            value = Number.parseFloat(value)
            if (isNaN(value)) value = 0
          }

          transaction[header] = value
        })

        transactions.push(transaction as Transaction)
      }

      return {
        success: true,
        data: transactions,
      }
    } catch (err) {
      console.error("CSV parsing error:", err)
      return {
        success: false,
        error: "Failed to parse CSV file",
      }
    }
  }

  return (
    <Card className="border-donki-yellow/20 shadow-lg dark:border-donki-yellow/10 dark:bg-black/20 overflow-hidden rounded-xl animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-donki-yellow/10 to-transparent dark:from-donki-yellow/5 border-b border-donki-yellow/10">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Upload className="mr-2 h-5 w-5 text-donki-yellow" />
          Upload New Dataset
        </CardTitle>
        <CardDescription className="text-base">
          Upload a CSV file containing customer purchase data to update the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border-2 border-dashed border-donki-yellow/30 p-8 text-center dark:border-donki-yellow/20 bg-muted/20 dark:bg-black/20 transition-all duration-300 hover:border-donki-yellow/50">
            <div className="h-16 w-16 rounded-full bg-donki-yellow/10 flex items-center justify-center">
              <FileUp className="h-8 w-8 text-donki-yellow" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
            </div>
            <label className="relative flex h-12 w-full max-w-xs cursor-pointer items-center justify-center rounded-lg bg-donki-yellow text-sm font-medium text-black hover:bg-donki-yellow/90 focus:outline-none focus:ring-2 focus:ring-donki-yellow focus:ring-offset-2 transition-all duration-200">
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </span>
              <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
            </label>
          </div>

          {file && (
            <div className="rounded-lg bg-muted/30 dark:bg-black/30 p-4 w-full max-w-md border border-muted">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Selected file:</p>
                  <p className="text-sm text-muted-foreground">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="w-full max-w-md bg-muted/30 dark:bg-black/30 p-4 rounded-lg border border-muted">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Processing data...</p>
                <p className="text-sm font-medium">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2 bg-muted dark:bg-muted/20" />
              <p className="mt-2 text-xs text-center text-muted-foreground">
                {progress < 30
                  ? "Preparing data..."
                  : progress < 50
                    ? "Fetching CSV file..."
                    : progress < 70
                      ? "Parsing data..."
                      : progress < 90
                        ? "Processing insights..."
                        : "Finalizing..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-donki-yellow/10 p-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
          className="border-donki-yellow/30 hover:bg-donki-yellow/10 hover:border-donki-yellow/50 transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-donki-yellow text-black hover:bg-donki-yellow/90 transition-all duration-200"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Process
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

