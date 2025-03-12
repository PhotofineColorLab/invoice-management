"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon, FileTextIcon, DownloadIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { deleteProduct } from "@/lib/redux/slices/productsSlice"
import { formatCurrency } from "@/lib/utils"
import { ProductEditDialog } from "./edit-dialogs/product-edit-dialog"
import { useMobile } from "@/hooks/use-mobile"
import { exportToPdf } from "@/lib/pdf-export"
import { toast } from "sonner"
import type { Product } from "@/app/types/data-types"

export function ProductList() {
  const products = useAppSelector((state) => state.products.items)
  const dispatch = useAppDispatch()
  const isMobile = useMobile()

  const [editingProduct, setEditingProduct] = useState<{ index: number; product: Product } | null>(null)

  const handleEdit = (index: number, product: Product) => {
    setEditingProduct({ index, product })
  }

  const handleDelete = (index: number) => {
    dispatch(deleteProduct(index))
  }

  const handleExportToPdf = (product: Product, index: number) => {
    try {
      exportToPdf("product", product, index)
      toast("Product has been exported as PDF.")
    } catch (error) {
      console.log("Error exporting Products", error)
      toast("An unknown error occurred")
    }
  }

  const handleExportAllToPdf = () => {
    try {
      exportToPdf("products", products)
      toast("All products have been exported as PDF.")
    } catch (error) {
      console.error("Error exporting all the products", error)
      toast("An unknown error occurred")
    }
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
      <div className="flex justify-between items-center mb-4 mt-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Button
          onClick={handleExportAllToPdf}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          {isMobile ? "Export All" : "Export All Products"}
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={index}>
            <CardHeader className={`pb-2 ${isMobile ? "px-4 py-3" : ""}`}>
              <div className="flex justify-between items-start">
                <CardTitle className={isMobile ? "text-lg" : "text-xl"}>{product.name}</CardTitle>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index, product)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-2" : ""}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">SKU/ID</p>
                  <p className="font-medium text-sm md:text-base">{product.sku || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-sm md:text-base">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium text-sm md:text-base">{product.quantity}</p>
                </div>
                {product.description && (
                  <div className="md:col-span-3">
                    <p className="text-xs md:text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-sm md:text-base">{product.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className={`${isMobile ? "px-4 py-3" : "pt-0"} flex justify-end`}>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => handleExportToPdf(product, index)}
                className="flex items-center gap-2"
              >
                <FileTextIcon className="h-4 w-4" />
                {isMobile ? "Export" : "Export as PDF"}
              </Button>
            </CardFooter>
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

