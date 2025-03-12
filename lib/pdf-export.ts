"use client"

import {jsPDF} from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency, formatDate } from "./utils"
import type { Customer, Invoice, Product } from "@/app/types/data-types"

type ExportType = "invoice" | "invoices" | "product" | "products" | "customer" | "customers"

export function exportToPdf(
  type: ExportType,
  data: Invoice | Product | Customer | Invoice[] | Product[] | Customer[],
  index?: number,
): void {
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Export`,
    subject: "Invoice Management System",
    creator: "Invoice Management System",
  })

  // Add header with current date
  const currentDate = new Date().toLocaleDateString()
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on ${currentDate}`, 14, 10)

  // Add title
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text(
    `${type.charAt(0).toUpperCase() + type.slice(1)} ${index !== undefined ? `#${index + 1}` : "Report"}`,
    14,
    20,
  )

  // Add content based on type
  switch (type) {
    case "invoice":
      exportInvoice(doc, data as Invoice)
      break
    case "invoices":
      exportInvoices(doc, data as Invoice[])
      break
    case "product":
      exportProduct(doc, data as Product)
      break
    case "products":
      exportProducts(doc, data as Product[])
      break
    case "customer":
      exportCustomer(doc, data as Customer)
      break
    case "customers":
      exportCustomers(doc, data as Customer[])
      break
  }

  // Save the PDF
  doc.save(`${type}${index !== undefined ? `-${index + 1}` : ""}-export.pdf`)
}

function exportInvoice(doc: jsPDF, invoice: Invoice): void {
  // Add invoice details
  doc.setFontSize(12)
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 30)
  doc.text(`Date: ${formatDate(invoice.date)}`, 14, 38)
  if (invoice.dueDate) {
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 46)
  }
  doc.text(`Vendor: ${invoice.vendor}`, 14, invoice.dueDate ? 54 : 46)
  doc.text(`Customer: ${invoice.customer}`, 14, invoice.dueDate ? 62 : 54)
  doc.text(`Amount: ${formatCurrency(invoice.amount)}`, 14, invoice.dueDate ? 70 : 62)
  doc.text(`Status: ${invoice.status}`, 14, invoice.dueDate ? 78 : 70)

  if (invoice.paymentTerms) {
    doc.text(`Payment Terms: ${invoice.paymentTerms}`, 14, invoice.dueDate ? 86 : 78)
  }

  // Add items table if available
  if (invoice.items && invoice.items.length > 0) {
    const startY = invoice.dueDate ? (invoice.paymentTerms ? 94 : 86) : invoice.paymentTerms ? 86 : 78

    doc.text("Items:", 14, startY)

    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ])

    autoTable(doc, {
      head: [["Description", "Quantity", "Unit Price", "Total"]],
      body: tableData,
      startY: startY + 5,
      margin: { left: 14 },
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })
  }
}

function exportInvoices(doc: jsPDF, invoices: Invoice[]): void {
  // Create table data
  const tableData = invoices.map((invoice) => [
    invoice.invoiceNumber,
    formatDate(invoice.date),
    invoice.vendor,
    invoice.customer,
    formatCurrency(invoice.amount),
    invoice.status,
  ])

  // Add table
  autoTable(doc, {
    head: [["Invoice #", "Date", "Vendor", "Customer", "Amount", "Status"]],
    body: tableData,
    startY: 30,
    margin: { left: 14 },
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
  })
}

function exportProduct(doc: jsPDF, product: Product): void {
  // Add product details
  doc.setFontSize(12)
  doc.text(`Name: ${product.name}`, 14, 30)
  if (product.sku) {
    doc.text(`SKU/ID: ${product.sku}`, 14, 38)
  }
  doc.text(`Price: ${formatCurrency(product.price)}`, 14, product.sku ? 46 : 38)
  doc.text(`Quantity: ${product.quantity}`, 14, product.sku ? 54 : 46)

  if (product.description) {
    doc.text("Description:", 14, product.sku ? 62 : 54)

    // Handle multi-line description
    const splitDescription = doc.splitTextToSize(product.description, 180)
    doc.text(splitDescription, 14, product.sku ? 70 : 62)
  }
}

function exportProducts(doc: jsPDF, products: Product[]): void {
  // Create table data
  const tableData = products.map((product) => [
    product.name,
    product.sku || "N/A",
    formatCurrency(product.price),
    product.quantity.toString(),
    product.description
      ? product.description.length > 30
        ? product.description.substring(0, 30) + "..."
        : product.description
      : "N/A",
  ])

  // Add table
  autoTable(doc, {
    head: [["Name", "SKU/ID", "Price", "Quantity", "Description"]],
    body: tableData,
    startY: 30,
    margin: { left: 14 },
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
  })
}

function exportCustomer(doc: jsPDF, customer: Customer): void {
  // Add customer details
  doc.setFontSize(12)
  doc.text(`Name: ${customer.name}`, 14, 30)
  doc.text(`Email: ${customer.email || "N/A"}`, 14, 38)
  doc.text(`Phone: ${customer.phone || "N/A"}`, 14, 46)

  if (customer.id) {
    doc.text(`Customer ID: ${customer.id}`, 14, 54)
  }

  if (customer.address) {
    doc.text("Address:", 14, customer.id ? 62 : 54)

    // Handle multi-line address
    const splitAddress = doc.splitTextToSize(customer.address, 180)
    doc.text(splitAddress, 14, customer.id ? 70 : 62)
  }
}

function exportCustomers(doc: jsPDF, customers: Customer[]): void {
  // Create table data
  const tableData = customers.map((customer) => [
    customer.name,
    customer.email || "N/A",
    customer.phone || "N/A",
    customer.id || "N/A",
    customer.address
      ? customer.address.length > 30
        ? customer.address.substring(0, 30) + "..."
        : customer.address
      : "N/A",
  ])

  // Add table
  autoTable(doc, {
    head: [["Name", "Email", "Phone", "Customer ID", "Address"]],
    body: tableData,
    startY: 30,
    margin: { left: 14 },
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
  })
}

