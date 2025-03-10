export interface Invoice {
    invoiceNumber: string
    date: string
    dueDate?: string
    vendor: string
    customer: string
    amount: number
    status: string
    paymentTerms?: string
    items?: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  
  export interface Product {
    name: string
    sku?: string
    description?: string
    price: number
    quantity: number
  }
  
  export interface Customer {
    name: string
    email?: string
    phone?: string
    address?: string
    id?: string
  }
  
  export interface CategoryData {
    invoices: Invoice[]
    products: Product[]
    customers: Customer[]
  }
  
  