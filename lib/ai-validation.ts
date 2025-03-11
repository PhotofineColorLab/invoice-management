"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { store } from "./redux/store";
import { updateInvoice } from "./redux/slices/invoicesSlice";
import { updateProduct } from "./redux/slices/productsSlice";
import { updateCustomer } from "./redux/slices/customersSlice";
import type {
  CategoryData,
  Invoice,
  Product,
  Customer,
} from "@/app/types/data-types";

export async function validateData(data: CategoryData): Promise<void> {
  // Validate and fix invoices
  for (let i = 0; i < data.invoices.length; i++) {
    const invoice = data.invoices[i];
    const fixedInvoice = await validateInvoice(invoice);
    if (JSON.stringify(invoice) !== JSON.stringify(fixedInvoice)) {
      store.dispatch(updateInvoice({ index: i, invoice: fixedInvoice }));
    }
  }

  // Validate and fix products
  for (let i = 0; i < data.products.length; i++) {
    const product = data.products[i];
    const fixedProduct = await validateProduct(product);
    if (JSON.stringify(product) !== JSON.stringify(fixedProduct)) {
      store.dispatch(updateProduct({ index: i, product: fixedProduct }));
    }
  }

  // Validate and fix customers
  for (let i = 0; i < data.customers.length; i++) {
    const customer = data.customers[i];
    const fixedCustomer = await validateCustomer(customer);
    if (JSON.stringify(customer) !== JSON.stringify(fixedCustomer)) {
      store.dispatch(updateCustomer({ index: i, customer: fixedCustomer }));
    }
  }
}

async function validateInvoice(invoice: Invoice): Promise<Invoice> {
  // Check for missing or invalid values
  const missingFields = [];

  if (!invoice.invoiceNumber || invoice.invoiceNumber === "N/A")
    missingFields.push("invoiceNumber");
  if (!invoice.date || invoice.date === "N/A") missingFields.push("date");
  if (!invoice.vendor || invoice.vendor === "N/A") missingFields.push("vendor");
  if (!invoice.customer || invoice.customer === "N/A")
    missingFields.push("customer");
  if (!invoice.amount || isNaN(invoice.amount)) missingFields.push("amount");
  if (!invoice.status || invoice.status === "N/A") missingFields.push("status");

  // If no missing fields, return the original invoice
  if (missingFields.length === 0) return invoice;

  // Use AI to fix missing fields
  try {
    const prompt = `
      I have an invoice with some missing or invalid fields: ${missingFields.join(
        ", "
      )}.
      Here's the current invoice data:
      ${JSON.stringify(invoice, null, 2)}
      
      Please provide reasonable values for the missing fields based on the available information.
      Return ONLY a valid JSON object with the fixed invoice data.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const fixedInvoice = JSON.parse(jsonMatch[0]) as Invoice;
        return {
          ...invoice,
          ...fixedInvoice,
        };
      }
    } catch (error) {
      console.error(
        "Failed to parse AI response for invoice validation:",
        error
      );
    }
  } catch (error) {
    console.error("Error validating invoice:", error);
  }

  return invoice;
}

async function validateProduct(product: Product): Promise<Product> {
  // Check for missing or invalid values
  const missingFields = [];

  if (!product.name || product.name === "N/A") missingFields.push("name");
  if (!product.price || isNaN(product.price)) missingFields.push("price");
  if (!product.quantity || isNaN(product.quantity))
    missingFields.push("quantity");

  // If no missing fields, return the original product
  if (missingFields.length === 0) return product;

  // Use AI to fix missing fields
  try {
    const prompt = `
      I have a product with some missing or invalid fields: ${missingFields.join(
        ", "
      )}.
      Here's the current product data:
      ${JSON.stringify(product, null, 2)}
      
      Please provide reasonable values for the missing fields based on the available information.
      Return ONLY a valid JSON object with the fixed product data.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const fixedProduct = JSON.parse(jsonMatch[0]) as Product;
        return {
          ...product,
          ...fixedProduct,
        };
      }
    } catch (error) {
      console.error(
        "Failed to parse AI response for product validation:",
        error
      );
    }
  } catch (error) {
    console.error("Error validating product:", error);
  }

  return product;
}

async function validateCustomer(customer: Customer): Promise<Customer> {
  // Check for missing or invalid values
  const missingFields = [];

  if (!customer.name || customer.name === "N/A") missingFields.push("name");

  // If no missing fields, return the original customer
  if (missingFields.length === 0) return customer;

  // Use AI to fix missing fields
  try {
    const prompt = `
      I have a customer with some missing or invalid fields: ${missingFields.join(
        ", "
      )}.
      Here's the current customer data:
      ${JSON.stringify(customer, null, 2)}
      
      Please provide reasonable values for the missing fields based on the available information.
      Return ONLY a valid JSON object with the fixed customer data.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const fixedCustomer = JSON.parse(jsonMatch[0]) as Customer;
        return {
          ...customer,
          ...fixedCustomer,
        };
      }
    } catch (error) {
      console.error(
        "Failed to parse AI response for customer validation:",
        error
      );
    }
  } catch (error) {
    console.error("Error validating customer:", error);
  }

  return customer;
}
