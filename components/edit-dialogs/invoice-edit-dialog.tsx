"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch } from "@/lib/redux/hooks"
import { updateInvoice } from "@/lib/redux/slices/invoicesSlice"
import { toast } from "sonner" // Import the toast function from Sonner
import type { Invoice } from "@/app/types/data-types"

interface InvoiceEditDialogProps {
    invoice: Invoice
    index: number
    open: boolean
    onClose: () => void
}

export function InvoiceEditDialog({ invoice, index, open, onClose }: InvoiceEditDialogProps) {
    const [formData, setFormData] = useState<Invoice>({ ...invoice })
    const dispatch = useAppDispatch()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
        }))
    }

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            status: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        dispatch(updateInvoice({ index, invoice: formData }))

        // Use Sonner's toast function for notification
        toast.success(`Invoice #${formData.invoiceNumber} has been updated.`)

        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Invoice #{invoice.invoiceNumber}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="invoiceNumber" className="text-right">
                                Invoice #
                            </Label>
                            <Input
                                id="invoiceNumber"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date.split("T")[0]}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        {formData.dueDate && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dueDate" className="text-right">
                                    Due Date
                                </Label>
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate.split("T")[0]}
                                    onChange={handleChange}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vendor" className="text-right">
                                Vendor
                            </Label>
                            <Input id="vendor" name="vendor" value={formData.vendor} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">
                                Customer
                            </Label>
                            <Input
                                id="customer"
                                name="customer"
                                value={formData.customer}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select value={formData.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.paymentTerms && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentTerms" className="text-right">
                                    Payment Terms
                                </Label>
                                <Input
                                    id="paymentTerms"
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
