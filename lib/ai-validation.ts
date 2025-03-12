"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { store } from "./redux/store"
import { updateInvoice } from "./redux/slices/invoicesSlice"
import { updateProduct } from "./redux/slices/productsSlice"
import { updateCustomer } from "./redux/slices/customersSlice"
import type { CategoryData, Invoice, Product, Customer } from "@/app/types/data-types"

export async function validateData(data: CategoryData): Promise<void> {
  // Validate and fix invoices
  for (let i = 0; i < data.invoices.length; i++) {
    const invoice = data.invoices[i]
    const fixedInvoice = await validateInvoice(invoice)
    if (JSON.stringify(invoice) !== JSON.stringify(fixedInvoice)) {
      store.dispatch(updateInvoice({ index: i, invoice: fixedInvoice }))
    }
  }

  // Validate and fix products
  for (let i = 0; i < data.products.length; i++) {
    const product = data.products[i]
    const fixedProduct = await validateProduct(product)
    if (JSON.stringify(product) !== JSON.stringify(fixedProduct)) {
      store.dispatch(updateProduct({ index: i, product: fixedProduct }))
    }
  }

  // Validate and fix customers
  for (let i = 0; i < data.customers.length; i++) {
    const customer = data.customers[i]
    const fixedCustomer = await validateCustomer(customer)
    if (JSON.stringify(customer) !== JSON.stringify(fixedCustomer)) {
      store.dispatch(updateCustomer({ index: i, customer: fixedCustomer }))
    }
  }
}

async function validateInvoice(invoice: Invoice): Promise<Invoice> {
  // Define expected fields and their data types
  const fieldDefinitions = {
    invoiceNumber: { type: "string", description: "Invoice identifier, usually formatted as INV-XXXX or similar" },
    date: { type: "date", description: "Invoice issue date in YYYY-MM-DD format" },
    dueDate: { type: "date", description: "Payment due date in YYYY-MM-DD format" },
    vendor: { type: "string", description: "Company or entity issuing the invoice" },
    customer: { type: "string", description: "Company or entity receiving the invoice" },
    amount: { type: "number", description: "Total invoice amount" },
    status: {
      type: "enum",
      description: "Current payment status",
      options: ["Paid", "Unpaid", "Overdue", "Pending", "Cancelled", "Partially Paid"],
    },
    paymentTerms: { type: "string", description: "Terms of payment, e.g., 'Net 30', 'Due on Receipt'" },
  }

  // Check for missing or invalid values
  const issues = []
  const missingFields = []

  // Check required fields
  if (!invoice.invoiceNumber || invoice.invoiceNumber === "N/A") {
    issues.push({ field: "invoiceNumber", issue: "missing", definition: fieldDefinitions.invoiceNumber })
    missingFields.push("invoiceNumber")
  }

  if (!invoice.date || invoice.date === "N/A") {
    issues.push({ field: "date", issue: "missing", definition: fieldDefinitions.date })
    missingFields.push("date")
  } else if (isNaN(new Date(invoice.date).getTime())) {
    issues.push({ field: "date", issue: "invalid", value: invoice.date, definition: fieldDefinitions.date })
  }

  if (!invoice.vendor || invoice.vendor === "N/A") {
    issues.push({ field: "vendor", issue: "missing", definition: fieldDefinitions.vendor })
    missingFields.push("vendor")
  }

  if (!invoice.customer || invoice.customer === "N/A") {
    issues.push({ field: "customer", issue: "missing", definition: fieldDefinitions.customer })
    missingFields.push("customer")
  }

  if (!invoice.amount || isNaN(invoice.amount)) {
    issues.push({ field: "amount", issue: "missing", definition: fieldDefinitions.amount })
    missingFields.push("amount")
  }

  if (!invoice.status || invoice.status === "N/A") {
    issues.push({ field: "status", issue: "missing", definition: fieldDefinitions.status })
    missingFields.push("status")
  } else if (fieldDefinitions.status.options && !fieldDefinitions.status.options.includes(invoice.status)) {
    issues.push({
      field: "status",
      issue: "invalid",
      value: invoice.status,
      definition: fieldDefinitions.status,
    })
  }

  // Check optional fields if present but invalid
  if (invoice.dueDate && isNaN(new Date(invoice.dueDate).getTime())) {
    issues.push({ field: "dueDate", issue: "invalid", value: invoice.dueDate, definition: fieldDefinitions.dueDate })
  }

  // If no issues, return the original invoice
  if (issues.length === 0) return invoice

  // Use AI to fix issues
  try {
    const prompt = `
      I have an invoice with data inconsistencies that need to be fixed. Please analyze the issues and provide appropriate corrections based on the field definitions and available data.

      Current invoice data:
      ${JSON.stringify(invoice, null, 2)}

      Field definitions:
      ${JSON.stringify(fieldDefinitions, null, 2)}

      Issues detected:
      ${JSON.stringify(issues, null, 2)}

      Please provide a corrected version of the invoice with these guidelines:
      1. For missing required fields, generate reasonable values based on the field definition and other available data
      2. For invalid values, correct them to match the expected format or type
      3. For date fields, ensure they are in YYYY-MM-DD format
      4. For status fields, ensure they match one of the allowed options
      5. For amount fields, ensure they are valid numbers
      6. If a due date is missing but payment terms are available, calculate a reasonable due date
      7. Maintain all other fields that don't have issues

      Return ONLY a valid JSON object with the fixed invoice data and nothing else.
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    })

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const fixedInvoice = JSON.parse(jsonMatch[0]) as Invoice

        // Validate the fixed data to ensure it's reasonable
        const validatedInvoice = {
          ...invoice,
          ...fixedInvoice,
          // Ensure amount is a number
          amount:
            typeof fixedInvoice.amount === "number"
              ? fixedInvoice.amount
              : typeof fixedInvoice.amount === "string"
                ? Number.parseFloat(fixedInvoice.amount)
                : invoice.amount,
        }

        return validatedInvoice
      }
    } catch (error) {
      console.error("Failed to parse AI response for invoice validation:", error)
    }
  } catch (error) {
    console.error("Error validating invoice:", error)
  }

  return invoice
}

async function validateProduct(product: Product): Promise<Product> {
  // Define expected fields and their data types
  const fieldDefinitions = {
    name: { type: "string", description: "Product name or title" },
    sku: { type: "string", description: "Stock Keeping Unit, unique product identifier" },
    description: { type: "string", description: "Detailed description of the product" },
    price: { type: "number", description: "Unit price of the product" },
    quantity: { type: "integer", description: "Number of units available or ordered" },
  }

  // Check for missing or invalid values
  const issues = []
  const missingFields = []

  // Check required fields
  if (!product.name || product.name === "N/A") {
    issues.push({ field: "name", issue: "missing", definition: fieldDefinitions.name })
    missingFields.push("name")
  }

  if (!product.price || isNaN(product.price)) {
    issues.push({ field: "price", issue: "missing", definition: fieldDefinitions.price })
    missingFields.push("price")
  }

  if (product.quantity === undefined || product.quantity === null || isNaN(product.quantity)) {
    issues.push({ field: "quantity", issue: "missing", definition: fieldDefinitions.quantity })
    missingFields.push("quantity")
  }

  // If no issues, return the original product
  if (issues.length === 0) return product

  // Use AI to fix issues
  try {
    const prompt = `
      I have a product with data inconsistencies that need to be fixed. Please analyze the issues and provide appropriate corrections based on the field definitions and available data.

      Current product data:
      ${JSON.stringify(product, null, 2)}

      Field definitions:
      ${JSON.stringify(fieldDefinitions, null, 2)}

      Issues detected:
      ${JSON.stringify(issues, null, 2)}

      Please provide a corrected version of the product with these guidelines:
      1. For missing required fields, generate reasonable values based on the field definition and other available data
      2. For invalid values, correct them to match the expected format or type
      3. For price fields, ensure they are valid numbers
      4. For quantity fields, ensure they are valid integers
      5. If generating a product name, make it descriptive and realistic
      6. If generating a SKU, follow common formats like ABC-12345
      7. Maintain all other fields that don't have issues

      Return ONLY a valid JSON object with the fixed product data and nothing else.
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    })

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const fixedProduct = JSON.parse(jsonMatch[0]) as Product

        // Validate the fixed data to ensure it's reasonable
        const validatedProduct = {
          ...product,
          ...fixedProduct,
          // Ensure price is a number
          price:
            typeof fixedProduct.price === "number"
              ? fixedProduct.price
              : typeof fixedProduct.price === "string"
                ? Number.parseFloat(fixedProduct.price)
                : product.price,
          // Ensure quantity is an integer
          quantity:
            typeof fixedProduct.quantity === "number"
              ? Math.round(fixedProduct.quantity)
              : typeof fixedProduct.quantity === "string"
                ? Number.parseInt(fixedProduct.quantity, 10)
                : product.quantity,
        }

        return validatedProduct
      }
    } catch (error) {
      console.error("Failed to parse AI response for product validation:", error)
    }
  } catch (error) {
    console.error("Error validating product:", error)
  }

  return product
}

async function validateCustomer(customer: Customer): Promise<Customer> {
  // Define expected fields and their data types
  const fieldDefinitions = {
    name: { type: "string", description: "Customer's full name or company name" },
    email: { type: "email", description: "Customer's email address, format: name@domain.com" },
    phone: { type: "phone", description: "Customer's phone number, various formats accepted" },
    address: { type: "string", description: "Customer's physical address" },
    id: { type: "string", description: "Unique customer identifier" },
  }

  // Check for missing or invalid values
  const issues = []
  const missingFields = []

  // Check required fields
  if (!customer.name || customer.name === "N/A") {
    issues.push({ field: "name", issue: "missing", definition: fieldDefinitions.name })
    missingFields.push("name")
  }

  // Check optional fields if present but invalid
  if (customer.email && !isValidEmail(customer.email)) {
    issues.push({ field: "email", issue: "invalid", value: customer.email, definition: fieldDefinitions.email })
  }

  // If no issues, return the original customer
  if (issues.length === 0) return customer

  // Use AI to fix issues
  try {
    const prompt = `
      I have a customer record with data inconsistencies that need to be fixed. Please analyze the issues and provide appropriate corrections based on the field definitions and available data.

      Current customer data:
      ${JSON.stringify(customer, null, 2)}

      Field definitions:
      ${JSON.stringify(fieldDefinitions, null, 2)}

      Issues detected:
      ${JSON.stringify(issues, null, 2)}

      Please provide a corrected version of the customer record with these guidelines:
      1. For missing required fields, generate reasonable values based on the field definition and other available data
      2. For invalid values, correct them to match the expected format or type
      3. For email fields, ensure they follow the format name@domain.com
      4. For phone fields, ensure they are in a standard format
      5. If generating a customer name, make it realistic
      6. Maintain all other fields that don't have issues

      Return ONLY a valid JSON object with the fixed customer data and nothing else.
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    })

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const fixedCustomer = JSON.parse(jsonMatch[0]) as Customer
        return {
          ...customer,
          ...fixedCustomer,
        }
      }
    } catch (error) {
      console.error("Failed to parse AI response for customer validation:", error)
    }
  } catch (error) {
    console.error("Error validating customer:", error)
  }

  return customer
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

