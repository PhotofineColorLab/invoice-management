"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "./file-uploader"
import { InvoiceList } from "./invoice-list"
import { ProductList } from "./product-list"
import { CustomerList } from "./customer-list"
import { Header } from "./header"
import { ProcessingStatus } from "./processing-status"
import { ParsingError } from "./parsing-error"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setInvoices } from "@/lib/redux/slices/invoicesSlice"
import { setProducts } from "@/lib/redux/slices/productsSlice"
import { setCustomers } from "@/lib/redux/slices/customersSlice"
import { validateData } from "@/lib/ai-validation"
import type { CategoryData } from "@/app/types/data-types"

export function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [processedData, setProcessedData] = useState<CategoryData | null>(null)
  const [activeTab, setActiveTab] = useState("invoices")
  const [hasError, setHasError] = useState(false)

  const dispatch = useAppDispatch()

  const handleProcessingComplete = async (data: CategoryData) => {
    setProcessedData(data)
    setIsProcessing(false)
    setHasError(false)

    // Store data in Redux
    dispatch(setInvoices(data.invoices))
    dispatch(setProducts(data.products))
    dispatch(setCustomers(data.customers))

    // Validate data with AI
    setIsValidating(true)
    try {
      await validateData(data)
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleProcessingError = () => {
    setIsProcessing(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setHasError(false)
    setProcessedData(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Header />

      <div className="mt-8">
        <FileUploader
          onProcessingStart={() => {
            setIsProcessing(true)
            setHasError(false)
          }}
          onProcessingComplete={handleProcessingComplete}
          onProcessingError={handleProcessingError}
        />
      </div>

      {isProcessing && <ProcessingStatus />}

      {isValidating && (
        <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm flex items-center justify-center">
          <span className="animate-pulse mr-2">●</span>
          AI is validating and fixing missing data...
        </div>
      )}

      {hasError && <ParsingError onRetry={handleRetry} />}

      {processedData && !isProcessing && !hasError && (
        <div className="mt-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invoices">Invoices ({processedData.invoices.length})</TabsTrigger>
              <TabsTrigger value="products">Products ({processedData.products.length})</TabsTrigger>
              <TabsTrigger value="customers">Customers ({processedData.customers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              <InvoiceList />
            </TabsContent>
            <TabsContent value="products">
              <ProductList />
            </TabsContent>
            <TabsContent value="customers">
              <CustomerList />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

