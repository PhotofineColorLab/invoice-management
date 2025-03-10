import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Customer } from "@/app/types/data-types";

interface CustomerListProps {
    customers: Customer[]
}

export function CustomerList({ customers }: CustomerListProps) {
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
        <div className="space-y-4">
            {customers.map((customer, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{customer.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{customer.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{customer.phone || "N/A"}</p>
                            </div>
                            {customer.address && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{customer.address}</p>
                                </div>
                            )}
                            {customer.id && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer ID</p>
                                    <p className="font-medium">{customer.id}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

