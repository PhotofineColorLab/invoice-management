"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon, FileTextIcon, DownloadIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { deleteCustomer } from "@/lib/redux/slices/customersSlice"
import { CustomerEditDialog } from "./edit-dialogs/customer-edit-dialog"
import { useMobile } from "@/hooks/use-mobile"
import { exportToPdf } from "@/lib/pdf-export"
import { toast } from "sonner"
import type { Customer } from "@/app/types/data-types"

export function CustomerList() {
  const customers = useAppSelector((state) => state.customers.items)
  const dispatch = useAppDispatch()
  const isMobile = useMobile()

  const [editingCustomer, setEditingCustomer] = useState<{ index: number; customer: Customer } | null>(null)

  const handleEdit = (index: number, customer: Customer) => {
    setEditingCustomer({ index, customer })
  }

  const handleDelete = (index: number) => {
    dispatch(deleteCustomer(index))
  }

  const handleExportToPdf = (customer: Customer, index: number) => {
    try {
      exportToPdf("customer", customer, index)
      toast("PDF Export Successful")
    } catch (error) {
      toast("An unknown error occurred")
    }
  }

  const handleExportAllToPdf = () => {
    try {
      exportToPdf("customers", customers)
      toast("All customers have been exported as PDF.")
    } catch (error) {
      toast("An unknown error occurred")
    }
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No customers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Button
          onClick={handleExportAllToPdf}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          {isMobile ? "Export All" : "Export All Customers"}
        </Button>
      </div>

      <div className="space-y-4">
        {customers.map((customer, index) => (
          <Card key={index}>
            <CardHeader className={`pb-2 ${isMobile ? "px-4 py-3" : ""}`}>
              <div className="flex justify-between items-start">
                <CardTitle className={isMobile ? "text-lg" : "text-xl"}>{customer.name}</CardTitle>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index, customer)}>
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
                  <p className="text-xs md:text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm md:text-base">{customer.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm md:text-base">{customer.phone || "N/A"}</p>
                </div>
                {customer.address && (
                  <div className="md:col-span-2">
                    <p className="text-xs md:text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-sm md:text-base">{customer.address}</p>
                  </div>
                )}
                {customer.id && (
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium text-sm md:text-base">{customer.id}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className={`${isMobile ? "px-4 py-3" : "pt-0"} flex justify-end`}>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => handleExportToPdf(customer, index)}
                className="flex items-center gap-2"
              >
                <FileTextIcon className="h-4 w-4" />
                {isMobile ? "Export" : "Export as PDF"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingCustomer && (
        <CustomerEditDialog
          customer={editingCustomer.customer}
          index={editingCustomer.index}
          open={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </>
  )
}

