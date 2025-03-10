"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { FileUploader } from "./file-uploader"
import { InvoiceList } from "./invoice-list"
import { ProductList } from "./product-list"
import { CustomerList } from "./customer-list"
import { Header } from "./header"
import { ProcessingStatus } from "./processing-status"
import { ParsingError } from "./parsing-error"
import type { CategoryData } from "@/app/types/data-types"

export function Dashboard() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedData, setProcessedData] = useState<CategoryData | null>(null)
    const [activeTab, setActiveTab] = useState("invoices")
    const [hasError, setHasError] = useState(false)

    const handleProcessingComplete = (data: CategoryData) => {
        setProcessedData(data)
        setIsProcessing(false)
        setHasError(false)
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
                            <InvoiceList invoices={processedData.invoices} />
                        </TabsContent>
                        <TabsContent value="products">
                            <ProductList products={processedData.products} />
                        </TabsContent>
                        <TabsContent value="customers">
                            <CustomerList customers={processedData.customers} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}

