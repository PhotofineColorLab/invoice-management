import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Product } from "@/app/types/data-types";
import { formatCurrency } from "@/lib/utils";

interface ProductListProps {
    products: Product[]
}

export function ProductList({ products }: ProductListProps) {
    if (products.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No products found</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {products.map((product, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">SKU/ID</p>
                                <p className="font-medium">{product.sku || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-medium">{formatCurrency(product.price)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantity</p>
                                <p className="font-medium">{product.quantity}</p>
                            </div>
                            {product.description && (
                                <div className="md:col-span-3">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="font-medium">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

