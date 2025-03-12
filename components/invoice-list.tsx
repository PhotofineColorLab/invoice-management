"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, TrashIcon, FileTextIcon, DownloadIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { deleteInvoice } from "@/lib/redux/slices/invoicesSlice"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceEditDialog } from "./edit-dialogs/invoice-edit-dialog"
import { useMobile } from "@/hooks/use-mobile"
import { exportToPdf } from "@/lib/pdf-export"
import { toast } from "sonner"
import type { Invoice } from "@/app/types/data-types"

export function InvoiceList() {
  const invoices = useAppSelector((state) => state.invoices.items)
  const dispatch = useAppDispatch()
  const isMobile = useMobile()

  const [editingInvoice, setEditingInvoice] = useState<{ index: number; invoice: Invoice } | null>(null)

  const handleEdit = (index: number, invoice: Invoice) => {
    setEditingInvoice({ index, invoice })
  }

  const handleDelete = (index: number) => {
    dispatch(deleteInvoice(index))
  }

  const handleExportToPdf = (invoice: Invoice, index: number) => {
    try {
      exportToPdf("invoice", invoice, index)
      toast("Invoice has been exported as PDF.")
    } catch (error) {
      toast("An unknown error occurred")
    }
  }

  const handleExportAllToPdf = () => {
    try {
      exportToPdf("invoices", invoices)
      toast("All invoices have been exported as PDF.")
    } catch (error) {
      toast("An unknown error occurred")
    }
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No invoices found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <Button
          onClick={handleExportAllToPdf}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          {isMobile ? "Export All" : "Export All Invoices"}
        </Button>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice, index) => (
          <Card key={index}>
            <CardHeader className={`pb-2 ${isMobile ? "px-4 py-3" : ""}`}>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Invoice #{invoice.invoiceNumber}</CardTitle>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Badge className={invoice.status === "Paid" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}>
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index, invoice)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-2" : ""}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium text-sm md:text-base">{invoice.vendor}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-sm md:text-base">{invoice.customer}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-sm md:text-base">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-sm md:text-base">{formatCurrency(invoice.amount)}</p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium text-sm md:text-base">{formatDate(invoice.dueDate)}</p>
                  </div>
                )}
                {invoice.paymentTerms && (
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium text-sm md:text-base">{invoice.paymentTerms}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className={`${isMobile ? "px-4 py-3" : "pt-0"} flex justify-end`}>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => handleExportToPdf(invoice, index)}
                className="flex items-center gap-2"
              >
                <FileTextIcon className="h-4 w-4" />
                {isMobile ? "Export" : "Export as PDF"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingInvoice && (
        <InvoiceEditDialog
          invoice={editingInvoice.invoice}
          index={editingInvoice.index}
          open={!!editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}
    </>
  )
}