"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, TrashIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { deleteInvoice } from "@/lib/redux/slices/invoicesSlice"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceEditDialog } from "./edit-dialogs/invoice-edit-dialog"
import type { Invoice } from "@/app/types/data-types"

export function InvoiceList() {
    const invoices = useAppSelector((state) => state.invoices.items)
    const dispatch = useAppDispatch()

    const [editingInvoice, setEditingInvoice] = useState<{ index: number; invoice: Invoice } | null>(null)

    const handleEdit = (index: number, invoice: Invoice) => {
        setEditingInvoice({ index, invoice })
    }

    const handleDelete = (index: number) => {
        dispatch(deleteInvoice(index))
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
            <div className="space-y-4">
                {invoices.map((invoice, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">Invoice #{invoice.invoiceNumber}</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={invoice.status === "Paid" ? "secondary" : "default"}>{invoice.status}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(index, invoice)}>
                                        <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vendor</p>
                                    <p className="font-medium">{invoice.vendor}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{invoice.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatDate(invoice.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                                </div>
                                {invoice.dueDate && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                                    </div>
                                )}
                                {invoice.paymentTerms && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Terms</p>
                                        <p className="font-medium">{invoice.paymentTerms}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
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
