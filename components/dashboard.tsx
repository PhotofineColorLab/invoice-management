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
import { ValidationResults } from "./validation-results"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setInvoices } from "@/lib/redux/slices/invoicesSlice"
import { setProducts } from "@/lib/redux/slices/productsSlice"
import { setCustomers } from "@/lib/redux/slices/customersSlice"
import { validateData } from "@/lib/ai-validation"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import type { CategoryData } from "@/app/types/data-types"

export function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [processedData, setProcessedData] = useState<CategoryData | null>(null)
  const [activeTab, setActiveTab] = useState("invoices")
  const [hasError, setHasError] = useState(false)
  const [validationProgress, setValidationProgress] = useState<string>("")
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [showValidationResults, setShowValidationResults] = useState(false)

  const isMobile = useMobile()
  const dispatch = useAppDispatch()

  // Get current data from Redux store for comparison
  const currentInvoices = useAppSelector((state) => state.invoices.items)
  const currentProducts = useAppSelector((state) => state.products.items)
  const currentCustomers = useAppSelector((state) => state.customers.items)

  const handleProcessingComplete = async (data: CategoryData) => {
    setProcessedData(data)
    setIsProcessing(false)
    setHasError(false)

    // Store initial data in Redux
    dispatch(setInvoices(data.invoices))
    dispatch(setProducts(data.products))
    dispatch(setCustomers(data.customers))

    // Check if we need to validate data
    const needsValidation = checkIfNeedsValidation(data)

    if (needsValidation) {
      // Validate data with AI
      setIsValidating(true)
      setValidationProgress("Analyzing data for inconsistencies...")

      try {
        setTimeout(() => {
          setValidationProgress("Fixing missing and invalid values...")
        }, 2000)

        await validateData(data)

        // Compare before and after to see what was fixed
        const results = compareDataBeforeAfter(data, {
          invoices: currentInvoices,
          products: currentProducts,
          customers: currentCustomers,
        })

        setValidationResults(results)
        setShowValidationResults(true)

        toast("AI fixed data inconsistencies in your document.")
      } catch (error) {
        console.error("Validation error:", error)
        toast("Some data inconsistencies could not be fully resolved.")
      } finally {
        setIsValidating(false)
        setValidationProgress("")
      }
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

  // Helper function to check if data needs validation
  const checkIfNeedsValidation = (data: CategoryData): boolean => {
    // Check invoices
    for (const invoice of data.invoices) {
      if (
        !invoice.invoiceNumber ||
        !invoice.date ||
        !invoice.vendor ||
        !invoice.customer ||
        !invoice.amount ||
        !invoice.status ||
        invoice.invoiceNumber === "N/A" ||
        invoice.vendor === "N/A" ||
        invoice.customer === "N/A" ||
        invoice.status === "N/A" ||
        isNaN(invoice.amount)
      ) {
        return true
      }
    }

    // Check products
    for (const product of data.products) {
      if (
        !product.name ||
        !product.price ||
        product.quantity === undefined ||
        product.name === "N/A" ||
        isNaN(product.price) ||
        isNaN(product.quantity)
      ) {
        return true
      }
    }

    // Check customers
    for (const customer of data.customers) {
      if (!customer.name || customer.name === "N/A" || (customer.email && !isValidEmail(customer.email))) {
        return true
      }
    }

    return false
  }

  // Helper function to compare data before and after validation
  const compareDataBeforeAfter = (
    before: CategoryData,
    after: {
      invoices: typeof currentInvoices
      products: typeof currentProducts
      customers: typeof currentCustomers
    },
  ): any[] => {
    const results: any[] = []

    // Compare invoices
    before.invoices.forEach((invoice, index) => {
      if (index < after.invoices.length) {
        const afterInvoice = after.invoices[index]
        const fixedFields: string[] = []

        // Check each field
        Object.keys(afterInvoice).forEach((key) => {
          const typedKey = key as keyof typeof invoice
          if (
            JSON.stringify(invoice[typedKey]) !== JSON.stringify(afterInvoice[typedKey]) &&
            (!invoice[typedKey] ||
              invoice[typedKey] === "N/A" ||
              (typedKey === "amount" && isNaN(invoice[typedKey] as number)))
          ) {
            fixedFields.push(key)
          }
        })

        if (fixedFields.length > 0) {
          results.push({
            category: "invoice",
            itemIndex: index,
            itemName: afterInvoice.invoiceNumber,
            fixedFields,
          })
        }
      }
    })

    // Compare products
    before.products.forEach((product, index) => {
      if (index < after.products.length) {
        const afterProduct = after.products[index]
        const fixedFields: string[] = []

        // Check each field
        Object.keys(afterProduct).forEach((key) => {
          const typedKey = key as keyof typeof product
          if (
            JSON.stringify(product[typedKey]) !== JSON.stringify(afterProduct[typedKey]) &&
            (!product[typedKey] ||
              product[typedKey] === "N/A" ||
              (typedKey === "price" && isNaN(product[typedKey] as number)) ||
              (typedKey === "quantity" && isNaN(product[typedKey] as number)))
          ) {
            fixedFields.push(key)
          }
        })

        if (fixedFields.length > 0) {
          results.push({
            category: "product",
            itemIndex: index,
            itemName: afterProduct.name,
            fixedFields,
          })
        }
      }
    })

    // Compare customers
    before.customers.forEach((customer, index) => {
      if (index < after.customers.length) {
        const afterCustomer = after.customers[index]
        const fixedFields: string[] = []

        // Check each field
        Object.keys(afterCustomer).forEach((key) => {
          const typedKey = key as keyof typeof customer
          if (
            JSON.stringify(customer[typedKey]) !== JSON.stringify(afterCustomer[typedKey]) &&
            (!customer[typedKey] ||
              customer[typedKey] === "N/A" ||
              (typedKey === "email" && !isValidEmail(customer[typedKey] as string)))
          ) {
            fixedFields.push(key)
          }
        })

        if (fixedFields.length > 0) {
          results.push({
            category: "customer",
            itemIndex: index,
            itemName: afterCustomer.name,
            fixedFields,
          })
        }
      }
    })

    return results
  }

  // Helper function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <Header />

      <div className="mt-6 md:mt-8">
        <FileUploader
          onProcessingStart={() => {
            setIsProcessing(true)
            setHasError(false)
            setShowValidationResults(false)
          }}
          onProcessingComplete={handleProcessingComplete}
          onProcessingError={handleProcessingError}
        />
      </div>

      {isProcessing && <ProcessingStatus />}

      {isValidating && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <span className="animate-pulse mr-2">●</span>
              <span>AI is validating and fixing data inconsistencies...</span>
            </div>
            {validationProgress && <span className="text-xs mt-1 opacity-80">{validationProgress}</span>}
          </div>
        </div>
      )}

      {showValidationResults && validationResults.length > 0 && (
        <ValidationResults results={validationResults} onClose={() => setShowValidationResults(false)} />
      )}

      {hasError && <ParsingError onRetry={handleRetry} />}

      {processedData && !isProcessing && !hasError && (
        <div className="mt-6 md:mt-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-3"}`}>
              <TabsTrigger value="invoices" className={isMobile ? "py-2" : ""}>
                Invoices ({currentInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="products" className={isMobile ? "py-2" : ""}>
                Products ({currentProducts.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className={isMobile ? "py-2" : ""}>
                Customers ({currentCustomers.length})
              </TabsTrigger>
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

