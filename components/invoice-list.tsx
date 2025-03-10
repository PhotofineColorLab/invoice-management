import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/app/types/data-types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "./ui/badge"

interface InvoiceListProps {
    invoices: Invoice[]
}

export function InvoiceList({ invoices }: InvoiceListProps) {
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
        <div className="space-y-4">
            {invoices.map((invoice, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Invoice #{invoice.invoiceNumber}</CardTitle>
                            <Badge variant={invoice.status === "Paid" ? "default" : "destructive"}>{invoice.status}</Badge>
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
    )
}

