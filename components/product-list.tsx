"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { deleteProduct } from "@/lib/redux/slices/productsSlice"
import { formatCurrency } from "@/lib/utils"
import { ProductEditDialog } from "./edit-dialogs/product-edit-dialog"
import type { Product } from "@/app/types/data-types"
export function ProductList() {
  const products = useAppSelector((state) => state.products.items)
  const dispatch = useAppDispatch()

  const [editingProduct, setEditingProduct] = useState<{ index: number; product: Product } | null>(null)

  const handleEdit = (index: number, product: Product) => {
    setEditingProduct({ index, product })
  }

  const handleDelete = (index: number) => {
    dispatch(deleteProduct(index))
  }

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
    <>
      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index, product)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

      {editingProduct && (
        <ProductEditDialog
          product={editingProduct.product}
          index={editingProduct.index}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  )
}

